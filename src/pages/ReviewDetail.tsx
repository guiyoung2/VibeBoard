import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import type { Review, Comment } from "../types/review";

function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [commentContent, setCommentContent] = useState("");

  // Supabase에서 특정 리뷰 가져오기
  const { data: review, isLoading: isLoadingReview, error: reviewError } = useQuery({
    queryKey: ["review", id],
    queryFn: async () => {
      if (!id) throw new Error("리뷰 ID가 없습니다.");

      // 리뷰 정보 가져오기
      const { data: reviewData, error: reviewError } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", id)
        .single();

      if (reviewError) throw reviewError;
      if (!reviewData) throw new Error("리뷰를 찾을 수 없습니다.");

      // boardgame 정보 가져오기
      const { data: boardgameData, error: boardgameError } = await supabase
        .from("boardgames")
        .select("id, name, image_url")
        .eq("id", reviewData.boardgame_id)
        .single();

      if (boardgameError && boardgameError.code !== "PGRST116") {
        // PGRST116은 "결과가 없음" 에러이므로 무시
        console.error("보드게임 정보 가져오기 오류:", boardgameError);
      }

      // profile 정보 가져오기
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, nickname")
        .eq("id", reviewData.user_id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116은 "결과가 없음" 에러이므로 무시
        console.error("프로필 정보 가져오기 오류:", profileError);
      }

      // Review 타입에 맞게 변환
      return {
        id: reviewData.id,
        boardgame_id: reviewData.boardgame_id,
        user_id: reviewData.user_id,
        rating: reviewData.rating,
        content: reviewData.content,
        created_at: reviewData.created_at,
        updated_at: reviewData.updated_at,
        boardgame: boardgameData
          ? {
              id: boardgameData.id,
              name: boardgameData.name,
              image_url: boardgameData.image_url,
            }
          : undefined,
        profile: profileData
          ? {
              id: profileData.id,
              nickname: profileData.nickname,
            }
          : undefined,
      } as Review;
    },
    enabled: !!id,
  });

  // Supabase에서 댓글 목록 가져오기
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      if (!id) return [];

      // 댓글 목록 가져오기
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("review_id", id)
        .order("created_at", { ascending: true });

      // 에러 처리: 404 또는 테이블이 없을 때 빈 배열 반환
      if (commentsError) {
        // PGRST116: 결과가 없음
        // 404: 테이블이 없거나 접근 권한 없음
        // 에러 메시지에 404가 포함되어 있으면 빈 배열 반환
        if (
          commentsError.code === "PGRST116" ||
          commentsError.message?.includes("404") ||
          commentsError.message?.includes("relation") ||
          commentsError.message?.includes("does not exist")
        ) {
          console.warn("댓글 테이블을 찾을 수 없거나 접근할 수 없습니다:", commentsError.message);
          return [];
        }
        throw commentsError;
      }
      if (!commentsData || commentsData.length === 0) return [];

      // 각 댓글의 user_id 수집
      const userIds = [...new Set(commentsData.map((c) => c.user_id))];

      // profiles 정보 가져오기
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // profiles를 Map으로 변환 (빠른 조회를 위해)
      const profilesMap = new Map(
        (profilesData || []).map((p) => [p.id, p])
      );

      // 댓글 데이터와 조인된 데이터 결합
      return commentsData.map((comment) => ({
        id: comment.id,
        review_id: comment.review_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        profile: profilesMap.get(comment.user_id)
          ? {
              id: profilesMap.get(comment.user_id)!.id,
              nickname: profilesMap.get(comment.user_id)!.nickname,
            }
          : undefined,
      })) as Comment[];
    },
    enabled: !!id,
  });

  // 댓글 작성 mutation
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("로그인이 필요합니다.");
      if (!id) throw new Error("리뷰 ID가 없습니다.");

      const { data: comment, error } = await supabase
        .from("comments")
        .insert({
          review_id: id,
          user_id: user.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return comment;
    },
    onSuccess: () => {
      // 댓글 목록 캐시 무효화 (새 댓글이 목록에 반영되도록)
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      setCommentContent("");
    },
  });

  // 평점을 별표로 표시하는 함수 (채워진 별만)
  const renderStars = (rating: number) => {
    return "⭐".repeat(rating);
  };

  // 댓글 작성 핸들러
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    createCommentMutation.mutate(commentContent);
  };

  if (isLoadingReview) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-main">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (reviewError || !review) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>리뷰를 찾을 수 없습니다.</p>
            <Link
              to="/reviews"
              className="text-accent underline mt-2 inline-block"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/reviews"
          className="text-accent hover:text-accent/80 mb-4 inline-block transition-colors"
        >
          ← 목록으로
        </Link>

        <div className="bg-bg-card p-8 rounded-xl shadow-card border border-border">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-xl">
                  {review.profile?.nickname?.[0] || "U"}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-main mb-1">
                  {review.profile?.nickname || "익명 사용자"}의 리뷰
                </h1>
                <p className="text-sm text-text-sub">
                  {new Date(review.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl mb-2">{renderStars(review.rating)}</div>
              <p className="text-lg font-semibold text-text-main">
                {review.rating} / 5점
              </p>
            </div>
          </div>

          {/* 게임 정보 */}
          {review.boardgame && (
            <div className="mb-6 pb-6 border-b border-border">
              <div className="inline-flex items-center gap-3">
                {review.boardgame.image_url && (
                  <img
                    src={review.boardgame.image_url}
                    alt={review.boardgame.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="text-sm text-text-sub mb-1">리뷰한 게임</p>
                  <p className="text-xl font-bold text-accent">
                    {review.boardgame.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 리뷰 내용 */}
          <div>
            <h2 className="text-xl font-semibold text-text-main mb-4">
              리뷰 내용
            </h2>
            <p className="text-text-main leading-relaxed whitespace-pre-wrap text-lg">
              {review.content}
            </p>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="mt-8 bg-bg-card p-8 rounded-xl shadow-card border border-border">
          <h2 className="text-2xl font-bold text-primary mb-6">
            댓글 ({comments.length})
          </h2>

          {/* 댓글 작성 폼 */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="댓글을 작성해주세요..."
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
                disabled={createCommentMutation.isPending}
              />
              {createCommentMutation.error && (
                <p className="mb-3 text-sm text-red-600">
                  {createCommentMutation.error instanceof Error
                    ? createCommentMutation.error.message
                    : "댓글 작성 중 오류가 발생했습니다."}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={createCommentMutation.isPending || !commentContent.trim()}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createCommentMutation.isPending ? "작성 중..." : "댓글 작성"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-bg-muted rounded-lg text-center">
              <p className="text-text-sub mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
              <Link
                to="/auth/login"
                className="text-accent hover:text-accent-hover underline"
              >
                로그인하기
              </Link>
            </div>
          )}

          {/* 댓글 목록 */}
          {isLoadingComments ? (
            <div className="text-center py-8 text-text-sub">
              <p>댓글을 불러오는 중...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-bg rounded-lg border border-border"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">
                        {comment.profile?.nickname?.[0] || "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-text-main">
                          {comment.profile?.nickname || "익명 사용자"}
                        </h3>
                        <p className="text-sm text-text-sub">
                          {new Date(comment.created_at).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <p className="text-text-main leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-sub">
              <p>아직 작성된 댓글이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewDetail;
