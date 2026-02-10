import { Link } from "react-router-dom";
import type { Comment } from "../types/review";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { SkeletonCommentList } from "./Skeleton";

interface CommentSectionProps {
  comments: Comment[];
  isLoading: boolean;
  currentUserId: string | undefined;
  /** 댓글 작성 폼 */
  commentContent: string;
  onCommentContentChange: (value: string) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  createError: Error | null;
  isCreatePending: boolean;
  /** 댓글 수정/삭제 */
  editingCommentId: string | null;
  editCommentContent: string;
  onEditCommentContentChange: (value: string) => void;
  onStartEditComment: (comment: Comment) => void;
  onCancelEditComment: () => void;
  onUpdateComment: (e: React.FormEvent) => void;
  onDeleteComment: (commentId: string) => void;
  updateError: Error | null;
  isUpdatePending: boolean;
  isDeletePending: boolean;
}

export function CommentSection({
  comments,
  isLoading,
  currentUserId,
  commentContent,
  onCommentContentChange,
  onCommentSubmit,
  createError,
  isCreatePending,
  editingCommentId,
  editCommentContent,
  onEditCommentContentChange,
  onStartEditComment,
  onCancelEditComment,
  onUpdateComment,
  onDeleteComment,
  updateError,
  isUpdatePending,
  isDeletePending,
}: CommentSectionProps) {
  return (
    <div className="mt-8 bg-bg-card p-8 rounded-xl shadow-card border border-border">
      <h2 className="text-2xl font-bold text-primary dark:text-text-main mb-6">
        댓글 ({comments.length})
      </h2>

      {currentUserId ? (
        <CommentForm
          value={commentContent}
          onChange={onCommentContentChange}
          onSubmit={onCommentSubmit}
          error={createError}
          isPending={isCreatePending}
        />
      ) : (
        <div className="mb-8 p-4 bg-bg-muted rounded-lg text-center">
          <p className="text-text-sub mb-2">
            댓글을 작성하려면 로그인이 필요합니다.
          </p>
          <Link
            to="/auth/login"
            className="text-accent hover:text-accent-hover underline"
          >
            로그인하기
          </Link>
        </div>
      )}

      {isLoading ? (
        <SkeletonCommentList count={3} />
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              isEditing={editingCommentId === comment.id}
              editContent={editCommentContent}
              onEditContentChange={onEditCommentContentChange}
              onStartEdit={() => onStartEditComment(comment)}
              onCancelEdit={onCancelEditComment}
              onUpdate={onUpdateComment}
              onDelete={() => onDeleteComment(comment.id)}
              updateError={updateError}
              isUpdatePending={isUpdatePending}
              isDeletePending={isDeletePending}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-text-sub">
          <p>아직 작성된 댓글이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
