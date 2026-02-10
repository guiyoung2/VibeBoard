import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { allowReviewCreate } from "../lib/featureFlags";
import { Button } from "../components/Button";
import { StarRating } from "../components/StarRating";
import type { BoardGame } from "../types/boardgame";
import type { ReviewFormData } from "../types/review";

function ReviewCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<ReviewFormData>({
    boardgame_id: "",
    rating: 0,
    content: "",
  });
  const [errors, setErrors] = useState<{
    boardgame_id?: string;
    rating?: string;
    content?: string;
  }>({});
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  // 보드게임 목록 가져오기
  const { data: boardgames, isLoading: isLoadingGames } = useQuery({
    queryKey: ["boardgames"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boardgames")
        .select("id, name, image_url")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Pick<BoardGame, "id" | "name" | "image_url">[];
    },
  });

  // 리뷰 작성 mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      if (!allowReviewCreate)
        throw new Error(
          "현재 리뷰 작성은 프로젝트 설정에 따라 허용되지 않습니다.",
        );
      if (!user) throw new Error("로그인이 필요합니다.");

      const { data: review, error } = await supabase
        .from("reviews")
        .insert({
          boardgame_id: data.boardgame_id,
          user_id: user.id,
          rating: data.rating,
          content: data.content,
        })
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: (data) => {
      // 리뷰 목록 캐시 무효화 (새 리뷰가 목록에 반영되도록)
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      // 작성한 리뷰 상세 페이지로 이동
      navigate(`/reviews/${data.id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setBlockMessage(null);

    // 배포 등 리뷰 작성 비활성화 시: 경고만 표시하고 등록하지 않음
    if (!allowReviewCreate) {
      setBlockMessage("현재 배포 환경에서는 리뷰 작성이 되지 않습니다.");
      return;
    }

    // 검증
    const newErrors: typeof errors = {};

    if (!formData.boardgame_id.trim()) {
      newErrors.boardgame_id = "보드게임을 선택해주세요.";
    }

    if (formData.rating === 0) {
      newErrors.rating = "평점을 선택해주세요.";
    }

    if (!formData.content.trim()) {
      newErrors.content = "리뷰 내용을 입력해주세요.";
    } else if (formData.content.trim().length < 10) {
      newErrors.content = "리뷰 내용은 최소 10자 이상 입력해주세요.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 리뷰 작성
    createReviewMutation.mutate(formData);
  };

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-bg-card p-8 rounded-xl shadow-card border border-border text-center">
            <p className="text-text-main mb-4">
              리뷰를 작성하려면 로그인이 필요합니다.
            </p>
            <Button variant="primary" size="md" onClick={() => navigate("/auth/login")}>
              로그인하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Link
            to="/reviews"
            className="text-accent hover:text-accent/80 mb-4 inline-block transition-colors"
          >
            ← 목록으로
          </Link>
          <h1 className="text-4xl font-bold text-primary dark:text-text-main">
            리뷰 작성
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-bg-card p-8 rounded-xl shadow-card border border-border"
        >
          {/* 보드게임 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-text-main mb-2">
              보드게임 선택 *
            </label>
            {isLoadingGames ? (
              <p className="text-text-sub">로딩 중...</p>
            ) : (
              <select
                value={formData.boardgame_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    boardgame_id: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-bg-card text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">보드게임을 선택하세요</option>
                {boardgames?.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            )}
            {errors.boardgame_id && (
              <p className="mt-1 text-sm text-red-600">{errors.boardgame_id}</p>
            )}
          </div>

          {/* 평점 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-text-main mb-2">
              평점 *
            </label>
            <StarRating
              value={formData.rating}
              onChange={(rating) =>
                setFormData((prev) => ({ ...prev, rating }))
              }
              showScore
            />
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          {/* 리뷰 내용 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-text-main mb-2">
              리뷰 내용 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              rows={10}
              placeholder="게임에 대한 솔직한 리뷰를 작성해주세요..."
              className="w-full px-4 py-3 border border-border rounded-lg bg-bg text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="mt-1 text-sm text-text-sub">
              {formData.content.length}자 / 최소 10자 이상
            </p>
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* 리뷰 작성 비활성화 시 제출 시 표시되는 경고 */}
          {blockMessage && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-amber-800 dark:text-amber-200 text-sm font-medium">
              {blockMessage}
            </div>
          )}

          {/* 에러 메시지 */}
          {createReviewMutation.error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {createReviewMutation.error instanceof Error
                ? createReviewMutation.error.message
                : "리뷰 작성 중 오류가 발생했습니다."}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" size="md" onClick={() => navigate("/reviews")}>
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={createReviewMutation.isPending}
            >
              {createReviewMutation.isPending ? "작성 중..." : "리뷰 작성"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewCreate;
