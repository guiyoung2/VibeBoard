import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import type { Review } from "../types/review";
import { Button } from "../components/Button";
import { ErrorMessageWithRetry } from "../components/ErrorMessageWithRetry";
import { SkeletonReviewList } from "../components/Skeleton";
import { StarRating } from "../components/StarRating";

type ProfileSection = "settings" | "reviews";

function Profile() {
  const navigate = useNavigate();
  const { user, nickname, fetchNickname } = useAuthStore();
  const [section, setSection] = useState<ProfileSection>("settings");
  const [nicknameInput, setNicknameInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  // 현재 닉네임을 초기값으로 설정
  useEffect(() => {
    if (nickname) {
      setNicknameInput(nickname);
    }
  }, [nickname]);

  const validateNickname = (nickname: string): boolean => {
    return nickname.length > 0 && nickname.length <= 6;
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNicknameInput(value);
    setFieldError(null);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    setSuccess(false);

    if (!nicknameInput.trim()) {
      setFieldError("닉네임을 입력해주세요.");
      return;
    }
    if (!validateNickname(nicknameInput.trim())) {
      setFieldError("닉네임은 6글자 이하로 입력해주세요.");
      return;
    }
    if (nicknameInput.trim() === nickname) {
      setError("변경된 내용이 없습니다.");
      return;
    }
    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.rpc(
        "update_user_nickname",
        {
          user_id: user.id,
          new_nickname: nicknameInput.trim(),
        },
      );
      if (updateError) throw updateError;
      await fetchNickname(user.id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "닉네임 수정 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 본인 작성 리뷰 목록
  const {
    data: myReviews = [],
    isLoading: isLoadingReviews,
    error: reviewsError,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ["reviews", "my", user?.id],
    queryFn: async (): Promise<Review[]> => {
      if (!user?.id) return [];
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;
      if (!reviewsData?.length) return [];

      const boardgameIds = [
        ...new Set(
          reviewsData
            .map((r) => r.boardgame_id)
            .filter((id): id is string => !!id),
        ),
      ];
      let boardgamesData: {
        id: string;
        name: string;
        image_url: string | null;
      }[] = [];
      if (boardgameIds.length > 0) {
        const { data, error: bgError } = await supabase
          .from("boardgames")
          .select("id, name, image_url")
          .in("id", boardgameIds);
        if (bgError) throw bgError;
        boardgamesData = (data as typeof boardgamesData) || [];
      }
      const boardgamesMap = new Map(boardgamesData.map((bg) => [bg.id, bg]));

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
        profile: { id: user.id, nickname },
      })) as Review[];
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-bg-card p-8 rounded-xl shadow-card border border-border text-center">
            <p className="text-text-main mb-4">로그인이 필요합니다.</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/auth/login")}
            >
              로그인하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { key: ProfileSection; label: string }[] = [
    { key: "settings", label: "프로필 설정" },
    { key: "reviews", label: "작성한 리뷰 목록" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary dark:text-text-main mb-6 md:mb-8">
          마이페이지
        </h1>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* 왼쪽: 목록 (모바일에서는 상단 탭처럼) */}
          <nav
            className="flex md:flex-col gap-1 shrink-0 md:w-52"
            aria-label="프로필 메뉴"
          >
            {navItems.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={`px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${
                  section === key
                    ? isDark
                      ? "bg-accent text-white shadow-card"
                      : "bg-primary text-white shadow-card"
                    : "text-text-sub hover:bg-bg-muted hover:text-text-main"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* 오른쪽: 콘텐츠 */}
          <main className="flex-1 min-w-0">
            {section === "settings" && (
              <div className="bg-bg-card p-6 md:p-8 rounded-xl shadow-card border border-border">
                <h2 className="text-xl font-bold text-text-main mb-6">
                  닉네임 수정
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="nickname"
                      className="block text-sm font-bold text-text-main mb-2"
                    >
                      닉네임
                    </label>
                    <input
                      id="nickname"
                      type="text"
                      value={nicknameInput}
                      onChange={handleNicknameChange}
                      placeholder="닉네임을 입력하세요"
                      maxLength={6}
                      className={`w-full px-4 py-3 border rounded-lg bg-bg text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 ${
                        fieldError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-border focus:ring-primary"
                      }`}
                      disabled={loading}
                    />
                    {fieldError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {fieldError}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-text-sub">
                      {nicknameInput.length}/6 글자
                    </p>
                  </div>
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                      닉네임이 성공적으로 변경되었습니다.
                    </div>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={
                      loading ||
                      !nicknameInput.trim() ||
                      nicknameInput.trim() === nickname
                    }
                  >
                    {loading ? "수정 중..." : "닉네임 수정하기"}
                  </Button>
                </form>
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold text-text-main mb-4">
                    계정 정보
                  </h3>
                  <div className="space-y-2 text-text-sub text-sm">
                    <p>
                      <span className="font-medium text-text-main">
                        이메일:
                      </span>{" "}
                      {user.email}
                    </p>
                    <p>
                      <span className="font-medium text-text-main">
                        로그인 방식:
                      </span>{" "}
                      {user.app_metadata?.provider === "email"
                        ? "이메일"
                        : user.app_metadata?.provider === "google"
                          ? "Google"
                          : user.app_metadata?.provider === "github"
                            ? "GitHub"
                            : user.app_metadata?.provider === "kakao"
                              ? "Kakao"
                              : "소셜 로그인"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {section === "reviews" && (
              <div className="bg-bg-card p-6 md:p-8 rounded-xl shadow-card border border-border">
                <h2 className="text-xl font-bold text-text-main mb-6">
                  작성한 리뷰 목록
                </h2>
                {isLoadingReviews ? (
                  <SkeletonReviewList count={3} />
                ) : reviewsError ? (
                  <ErrorMessageWithRetry
                    message="리뷰 목록을 불러오는 중 오류가 발생했습니다."
                    onRetry={() => refetchReviews()}
                    size="sm"
                    className="!p-0 !border-0 !bg-transparent text-center py-8"
                  />
                ) : myReviews.length === 0 ? (
                  <div className="text-center py-12 text-text-sub">
                    <p className="mb-4">아직 작성한 리뷰가 없습니다.</p>
                    <Link
                      to="/reviews/create"
                      className={`inline-block px-4 py-2 rounded-lg text-white text-sm font-medium ${isDark ? "bg-accent hover:bg-accent-hover" : "bg-primary hover:bg-primary-soft"}`}
                    >
                      리뷰 작성하기
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {myReviews.map((review) => (
                      <li key={review.id}>
                        <Link
                          to={`/reviews/${review.id}`}
                          className="block p-4 rounded-xl border border-border hover:shadow-hover transition-shadow bg-bg"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-3 min-w-0">
                              {review.boardgame?.image_url && (
                                <img
                                  src={review.boardgame.image_url}
                                  alt=""
                                  className="w-12 h-12 object-cover rounded flex-shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-text-main truncate">
                                  {review.boardgame?.name ?? "알 수 없는 게임"}
                                </p>
                                <p className="text-sm text-text-sub">
                                  {new Date(
                                    review.created_at,
                                  ).toLocaleDateString("ko-KR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="text-lg shrink-0">
                              <StarRating value={review.rating} className="text-lg" />
                            </div>
                          </div>
                          <p className="text-text-main text-sm line-clamp-2">
                            {review.content}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Profile;
