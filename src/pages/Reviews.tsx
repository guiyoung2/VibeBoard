import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import type { Review } from "../types/review";

// 예시 리뷰 데이터 (하드코딩) - 주석처리: Supabase 연동으로 대체
// const exampleReviews: Review[] = [
//     {
//       id: "1",
//       boardgame_id: "1",
//       user_id: "1",
//       rating: 5,
//       content:
//         "정말 재미있는 보드게임이에요! 친구들과 함께 플레이했는데 모두가 즐거워했어요. 전략적 요소도 있고 운도 있어서 매번 다른 결과가 나와서 좋습니다. 특히 중반부부터 긴장감이 올라가는 게임플레이가 인상적이었어요.",
//       created_at: "2024-01-15T10:30:00Z",
//       updated_at: "2024-01-15T10:30:00Z",
//       boardgame: {
//         id: "1",
//         name: "카탄의 개척자들",
//         image_url: null,
//       },
//       profile: {
//         id: "1",
//         nickname: "보드게임러버",
//       },
//     },
//     {
//       id: "2",
//       boardgame_id: "2",
//       user_id: "2",
//       rating: 4,
//       content:
//         "처음 해보는 보드게임인데 생각보다 쉽게 배울 수 있어서 좋았어요. 규칙이 복잡해 보였지만 실제로는 직관적이고, 게임 시간도 적당해서 부담스럽지 않았습니다. 다만 승리 조건이 조금 애매한 부분이 있어서 4점 드립니다.",
//       created_at: "2024-01-20T14:15:00Z",
//       updated_at: "2024-01-20T14:15:00Z",
//       boardgame: {
//         id: "2",
//         name: "스플렌더",
//         image_url: null,
//       },
//       profile: {
//         id: "2",
//         nickname: "게임마스터",
//       },
//     },
//     {
//       id: "3",
//       boardgame_id: "3",
//       user_id: "3",
//       rating: 5,
//       content:
//         "가족과 함께 즐기기 완벽한 게임입니다! 아이들도 쉽게 이해할 수 있고, 어른들도 전략을 세우며 즐길 수 있어서 세대를 불문하고 모두가 즐거워했어요. 특히 게임 중간중간 웃음이 터져나와서 분위기가 정말 좋았습니다.",
//       created_at: "2024-01-25T09:45:00Z",
//       updated_at: "2024-01-25T09:45:00Z",
//       boardgame: {
//         id: "3",
//         name: "할리갈리",
//         image_url: null,
//       },
//       profile: {
//         id: "3",
//         nickname: "패밀리게이머",
//       },
//     },
//   ];

type SortOption = "none" | "rating-high" | "rating-low";

function Reviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("none");
  const { user } = useAuthStore();

  // Supabase에서 리뷰 목록 가져오기
  const { data: reviews, isLoading, error } = useQuery({
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
      const boardgameIds = [...new Set(reviewsData.map((r) => r.boardgame_id).filter((id): id is string => !!id))];
      const userIds = [...new Set(reviewsData.map((r) => r.user_id).filter((id): id is string => !!id))];

      // boardgames 정보 가져오기 (빈 배열이 아닐 때만)
      let boardgamesData: { id: string; name: string; image_url: string | null }[] = [];
      if (boardgameIds.length > 0) {
        const { data, error: boardgamesError } = await supabase
          .from("boardgames")
          .select("id, name, image_url")
          .in("id", boardgameIds);

        if (boardgamesError) throw boardgamesError;
        boardgamesData = (data as { id: string; name: string; image_url: string | null }[]) || [];
      }

      // profiles 정보 가져오기 (빈 배열이 아닐 때만)
      let profilesData: { id: string; nickname: string | null }[] = [];
      if (userIds.length > 0) {
        const { data, error: profilesError } = await supabase
          .from("profiles")
          .select("id, nickname")
          .in("id", userIds);

        if (profilesError) throw profilesError;
        profilesData = (data as { id: string; nickname: string | null }[]) || [];
      }

      // boardgames와 profiles를 Map으로 변환 (빠른 조회를 위해)
      const boardgamesMap = new Map(
        (boardgamesData || []).map((bg) => [bg.id, bg])
      );
      const profilesMap = new Map(
        (profilesData || []).map((p) => [p.id, p])
      );

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
          .includes(searchQuery.toLowerCase())
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

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-primary">게임 후기</h1>
          <div className="flex items-center gap-3">
            {!user && (
              <span className="text-sm text-text-sub">
                로그인 후 작성할 수 있습니다
              </span>
            )}
            <Link
              to={user ? "/reviews/create" : "/auth/login"}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-soft transition-colors font-medium"
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 max-w-2xl px-4 py-2 border border-border rounded-lg bg-bg-card text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-4 py-2 border border-border rounded-lg bg-bg-card text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="none">정렬 없음</option>
            <option value="rating-high">별점 높은순</option>
            <option value="rating-low">별점 낮은순</option>
          </select>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-bg-card p-8 rounded-xl shadow-card border border-border text-center">
              <p className="text-text-sub">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="bg-bg-card p-8 rounded-xl shadow-card border border-border text-center">
              <p className="text-red-600">리뷰를 불러오는 중 오류가 발생했습니다.</p>
            </div>
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
            <Link
              key={review.id}
              to={`/reviews/${review.id}`}
              className="block bg-bg-card p-6 rounded-xl shadow-card border border-border hover:shadow-hover transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
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
                        }
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
            ))
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

