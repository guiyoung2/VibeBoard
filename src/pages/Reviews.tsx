import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import type { Review } from "../types/review";
import { SkeletonReviewList } from "../components/Skeleton";

type SortOption = "none" | "rating-high" | "rating-low";

function Reviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("none");
  const [displayCount, setDisplayCount] = useState(3); // 초기 표시 개수
  const [prevDisplayCount, setPrevDisplayCount] = useState(0); // 이전 표시 개수 (애니메이션용)
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 3; // 한 번에 추가로 로드할 개수
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  // Supabase에서 리뷰 목록 가져오기
  const {
    data: reviews,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      // 먼저 리뷰 목록 가져오기
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;
      if (!reviewsData || reviewsData.length === 0) return [];

      // 각 리뷰의 boardgame_id와 user_id 수집 (null/undefined 제거)
      const boardgameIds = [
        ...new Set(
          reviewsData
            .map((r) => r.boardgame_id)
            .filter((id): id is string => !!id),
        ),
      ];
      const userIds = [
        ...new Set(
          reviewsData.map((r) => r.user_id).filter((id): id is string => !!id),
        ),
      ];

      // boardgames 정보 가져오기 (빈 배열이 아닐 때만)
      let boardgamesData: {
        id: string;
        name: string;
        image_url: string | null;
      }[] = [];
      if (boardgameIds.length > 0) {
        const { data, error: boardgamesError } = await supabase
          .from("boardgames")
          .select("id, name, image_url")
          .in("id", boardgameIds);

        if (boardgamesError) throw boardgamesError;
        boardgamesData =
          (data as { id: string; name: string; image_url: string | null }[]) ||
          [];
      }

      // profiles 정보 가져오기 (빈 배열이 아닐 때만)
      let profilesData: { id: string; nickname: string | null }[] = [];
      if (userIds.length > 0) {
        const { data, error: profilesError } = await supabase
          .from("profiles")
          .select("id, nickname")
          .in("id", userIds);

        if (profilesError) throw profilesError;
        profilesData =
          (data as { id: string; nickname: string | null }[]) || [];
      }

      // boardgames와 profiles를 Map으로 변환 (빠른 조회를 위해)
      const boardgamesMap = new Map(
        (boardgamesData || []).map((bg) => [bg.id, bg]),
      );
      const profilesMap = new Map((profilesData || []).map((p) => [p.id, p]));

      // 리뷰 데이터와 조인된 데이터 결합
      return reviewsData.map((review) => ({
        id: review.id,
        boardgame_id: review.boardgame_id,
        user_id: review.user_id,
        rating: review.rating,
        content: review.content,
        created_at: review.created_at,
        updated_at: review.updated_at,
        boardgame: boardgamesMap.get(review.boardgame_id)
          ? {
              id: boardgamesMap.get(review.boardgame_id)!.id,
              name: boardgamesMap.get(review.boardgame_id)!.name,
              image_url: boardgamesMap.get(review.boardgame_id)!.image_url,
            }
          : undefined,
        profile: profilesMap.get(review.user_id)
          ? {
              id: profilesMap.get(review.user_id)!.id,
              nickname: profilesMap.get(review.user_id)!.nickname,
            }
          : undefined,
      })) as Review[];
    },
  });

  // 평점을 별표로 표시하는 함수 (채워진 별만)
  const renderStars = (rating: number) => {
    return "⭐".repeat(rating);
  };

  // 검색어로 필터링 및 정렬된 리뷰 목록
  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    let filtered = reviews;

    // 검색 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter((review) =>
        review.boardgame?.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
    }

    // 정렬
    if (sortOption === "rating-high") {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sortOption === "rating-low") {
      filtered = [...filtered].sort((a, b) => a.rating - b.rating);
    }

    return filtered;
  }, [reviews, searchQuery, sortOption]);

  // 표시할 리뷰 목록 (무한 스크롤용)
  const displayedReviews = useMemo(() => {
    return filteredReviews.slice(0, displayCount);
  }, [filteredReviews, displayCount]);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || displayedReviews.length >= filteredReviews.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) => {
            setPrevDisplayCount(prev); // 이전 값 저장 (애니메이션용)
            return Math.min(prev + ITEMS_PER_PAGE, filteredReviews.length);
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // 뷰포트 하단에서 100px 전에 미리 로드
      },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.unobserve(loadMoreElement);
    };
  }, [displayedReviews.length, filteredReviews.length]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-primary dark:text-text-main">
            게임 후기
          </h1>
          <div className="flex items-center gap-3">
            {!user && (
              <span className="text-sm text-text-sub">
                로그인 후 작성할 수 있습니다
              </span>
            )}
            <Link
              to={user ? "/reviews/create" : "/auth/login"}
              className={`px-6 py-2 ${isDark ? "bg-accent hover:bg-accent-hover" : "bg-primary hover:bg-primary-soft"} text-white rounded-lg transition-colors font-medium`}
            >
              리뷰 작성
            </Link>
          </div>
        </div>

        {/* 검색창 및 필터 */}
        <div className="mb-6 flex items-center justify-between">
          <input
            type="text"
            placeholder="보드게임 이름으로 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPrevDisplayCount(0); // 검색어 변경 시 리셋
              setDisplayCount(3);
            }}
            className="flex-1 max-w-2xl px-4 py-2 border border-border rounded-lg bg-bg-card text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value as SortOption);
              setPrevDisplayCount(0); // 정렬 옵션 변경 시 리셋
              setDisplayCount(3);
            }}
            className="px-4 py-2 border border-border rounded-lg bg-bg-card text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="none">최신순</option>
            <option value="rating-high">별점 높은순</option>
            <option value="rating-low">별점 낮은순</option>
          </select>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <SkeletonReviewList count={5} />
          ) : error ? (
            <div className="bg-bg-card p-8 rounded-xl shadow-card border border-border text-center">
              <p className="text-text-main font-medium mb-2">
                리뷰를 불러오는 중 오류가 발생했습니다.
              </p>
              <p className="text-text-sub text-sm mb-4">{error.message}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className={`px-6 py-2 rounded-lg text-white font-medium ${isDark ? "bg-accent hover:bg-accent-hover" : "bg-primary hover:bg-primary-soft"}`}
              >
                다시 시도
              </button>
            </div>
          ) : displayedReviews.length > 0 ? (
            <>
              {displayedReviews.map((review, index) => {
                // 새로 추가된 리뷰들에만 애니메이션 적용
                const isNewReview = index >= prevDisplayCount;
                return (
                  <Link
                    key={review.id}
                    to={`/reviews/${review.id}`}
                    className={`block bg-bg-card p-6 rounded-xl shadow-card border border-border hover:shadow-hover transition-shadow cursor-pointer ${
                      isNewReview ? "animate-fade-in" : ""
                    }`}
                    style={
                      isNewReview
                        ? {
                            animationDelay: `${(index - prevDisplayCount) * 0.1}s`,
                            animationFillMode: "both",
                          }
                        : {}
                    }
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center">
                          <span className="text-primary dark:text-text-main font-semibold">
                            {review.profile?.nickname?.[0] || "U"}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-main">
                            {review.profile?.nickname || "익명 사용자"}
                          </h3>
                          <p className="text-sm text-text-sub">
                            {new Date(review.created_at).toLocaleDateString(
                              "ko-KR",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg mb-1">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm text-text-sub">
                          {review.rating} / 5점
                        </p>
                      </div>
                    </div>

                    {review.boardgame && (
                      <div className="mb-4">
                        <div className="inline-flex items-center gap-2">
                          {review.boardgame.image_url && (
                            <img
                              src={review.boardgame.image_url}
                              alt={review.boardgame.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <span className="font-medium text-accent">
                            {review.boardgame.name}
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-text-main leading-relaxed whitespace-pre-wrap line-clamp-3">
                      {review.content}
                    </p>
                  </Link>
                );
              })}
              {/* 무한 스크롤 트리거 */}
              {displayedReviews.length < filteredReviews.length && (
                <div ref={loadMoreRef} className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-text-sub">
                    더 많은 리뷰를 불러오는 중...
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-bg-card p-8 rounded-xl shadow-card border border-border text-center">
              <p className="text-text-sub">
                "{searchQuery}"에 대한 검색 결과가 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reviews;
