import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import type { Review, Comment } from "../types/review";
import { CommentSection } from "../components/CommentSection";
import { ErrorMessageWithRetry } from "../components/ErrorMessageWithRetry";
import { ReviewContent } from "../components/ReviewContent";
import { ReviewDetailHeader } from "../components/ReviewDetailHeader";
import { SkeletonDetail } from "../components/Skeleton";

function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [commentContent, setCommentContent] = useState("");

  // 리뷰 수정 상태
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editReviewRating, setEditReviewRating] = useState(0);
  const [editReviewContent, setEditReviewContent] = useState("");

  // 댓글 수정 상태
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  // Supabase에서 특정 리뷰 가져오기
  const {
    data: review,
    isLoading: isLoadingReview,
    error: reviewError,
    refetch: refetchReview,
  } = useQuery({
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
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useQuery({
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
          console.warn(
            "댓글 테이블을 찾을 수 없거나 접근할 수 없습니다:",
            commentsError.message,
          );
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
      const profilesMap = new Map((profilesData || []).map((p) => [p.id, p]));

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

  // 리뷰 수정 mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({
      rating,
      content,
    }: {
      rating: number;
      content: string;
    }) => {
      if (!user) throw new Error("로그인이 필요합니다.");
      if (!id) throw new Error("리뷰 ID가 없습니다.");

      const { data, error } = await supabase
        .from("reviews")
        .update({
          rating,
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review", id] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setIsEditingReview(false);
    },
  });

  // 리뷰 삭제 mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("로그인이 필요합니다.");
      if (!id) throw new Error("리뷰 ID가 없습니다.");

      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      navigate("/reviews");
    },
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

  // 댓글 수정 mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => {
      if (!user) throw new Error("로그인이 필요합니다.");

      const { data, error } = await supabase
        .from("comments")
        .update({
          content: content.trim(),
        })
        .eq("id", commentId)
        .eq("user_id", user.id)
        .select();

      if (error) {
        console.error("댓글 수정 오류:", error);
        console.error("오류 상세:", JSON.stringify(error, null, 2));
        throw error;
      }

      // 업데이트된 행이 없으면 에러
      if (!data || data.length === 0) {
        const errorMsg =
          "댓글을 수정할 수 없습니다. 권한이 없거나 댓글이 존재하지 않습니다.";
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      return data[0];
    },
    onMutate: async ({ commentId, content }) => {
      // Optimistic update: 즉시 UI 업데이트
      await queryClient.cancelQueries({ queryKey: ["comments", id] });

      const previousComments = queryClient.getQueryData<Comment[]>([
        "comments",
        id,
      ]);

      if (previousComments) {
        queryClient.setQueryData<Comment[]>(["comments", id], (old) => {
          if (!old) return old;
          return old.map((comment) =>
            comment.id === commentId
              ? { ...comment, content: content.trim() }
              : comment,
          );
        });
      }

      return { previousComments };
    },
    onError: (err, _variables, context) => {
      // 에러 발생 시 이전 상태로 복원
      if (context?.previousComments) {
        queryClient.setQueryData(["comments", id], context.previousComments);
      }
      // 에러 메시지 표시를 위해 상태 유지
      console.error("댓글 수정 실패:", err);
    },
    onSuccess: () => {
      setEditingCommentId(null);
      setEditCommentContent("");
      // 서버에서 최신 데이터 가져오기
      refetchComments();
    },
  });

  // 댓글 삭제 mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      // 댓글 목록 다시 가져오기
      await refetchComments();
    },
  });

  // 리뷰 수정 시작
  const handleStartEditReview = () => {
    if (review) {
      setEditReviewRating(review.rating);
      setEditReviewContent(review.content);
      setIsEditingReview(true);
    }
  };

  // 리뷰 수정 취소
  const handleCancelEditReview = () => {
    setIsEditingReview(false);
    setEditReviewRating(0);
    setEditReviewContent("");
  };

  // 리뷰 수정 제출
  const handleUpdateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReviewContent.trim() || editReviewRating === 0) return;
    updateReviewMutation.mutate({
      rating: editReviewRating,
      content: editReviewContent,
    });
  };

  // 리뷰 삭제 확인
  const handleDeleteReview = () => {
    if (window.confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
      deleteReviewMutation.mutate();
    }
  };

  // 댓글 작성 핸들러
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    createCommentMutation.mutate(commentContent);
  };

  // 댓글 수정 시작
  const handleStartEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  // 댓글 수정 취소
  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };

  // 댓글 수정 제출
  const handleUpdateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommentId || !editCommentContent.trim()) return;
    updateCommentMutation.mutate({
      commentId: editingCommentId,
      content: editCommentContent,
    });
  };

  // 댓글 삭제 확인
  const handleDeleteComment = (commentId: string) => {
    if (window.confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (isLoadingReview) {
    return (
      <div className="min-h-screen bg-bg">
        <SkeletonDetail />
      </div>
    );
  }

  if (reviewError || !review) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <ErrorMessageWithRetry
            message="리뷰를 불러오는 중 오류가 발생했습니다."
            detail={reviewError instanceof Error ? reviewError.message : "리뷰를 찾을 수 없습니다."}
            onRetry={() => refetchReview()}
            secondaryLink={{ to: "/reviews", label: "목록으로 돌아가기" }}
          />
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
          <ReviewDetailHeader review={review} />
          <ReviewContent
            review={review}
            isEditing={isEditingReview}
            editRating={editReviewRating}
            editContent={editReviewContent}
            onEditRatingChange={setEditReviewRating}
            onEditContentChange={setEditReviewContent}
            onStartEdit={handleStartEditReview}
            onCancelEdit={handleCancelEditReview}
            onUpdate={handleUpdateReview}
            onDelete={handleDeleteReview}
            currentUserId={user?.id}
            isUpdatePending={updateReviewMutation.isPending}
            isDeletePending={deleteReviewMutation.isPending}
            updateError={updateReviewMutation.error}
          />
        </div>

        <CommentSection
          comments={comments}
          isLoading={isLoadingComments}
          currentUserId={user?.id}
          commentContent={commentContent}
          onCommentContentChange={setCommentContent}
          onCommentSubmit={handleCommentSubmit}
          createError={createCommentMutation.error}
          isCreatePending={createCommentMutation.isPending}
          editingCommentId={editingCommentId}
          editCommentContent={editCommentContent}
          onEditCommentContentChange={setEditCommentContent}
          onStartEditComment={handleStartEditComment}
          onCancelEditComment={handleCancelEditComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          updateError={updateCommentMutation.error}
          isUpdatePending={updateCommentMutation.isPending}
          isDeletePending={deleteCommentMutation.isPending}
        />
      </div>
    </div>
  );
}

export default ReviewDetail;
