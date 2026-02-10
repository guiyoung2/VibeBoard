import type { Review } from "../types/review";
import { Button } from "./Button";
import { StarRating } from "./StarRating";

interface ReviewContentProps {
  review: Review;
  isEditing: boolean;
  editRating: number;
  editContent: string;
  onEditRatingChange: (v: number) => void;
  onEditContentChange: (v: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (e: React.FormEvent) => void;
  onDelete: () => void;
  currentUserId: string | undefined;
  isUpdatePending: boolean;
  isDeletePending: boolean;
  updateError: Error | null;
}

export function ReviewContent({
  review,
  isEditing,
  editRating,
  editContent,
  onEditRatingChange,
  onEditContentChange,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  currentUserId,
  isUpdatePending,
  isDeletePending,
  updateError,
}: ReviewContentProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-text-main mb-4">리뷰 내용</h2>
      {isEditing ? (
        <form onSubmit={onUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-text-main mb-2">
              평점 *
            </label>
            <StarRating
              value={editRating}
              onChange={onEditRatingChange}
              showScore
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-main mb-2">
              리뷰 내용 *
            </label>
            <textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              rows={10}
              placeholder="게임에 대한 솔직한 리뷰를 작성해주세요..."
              className="w-full px-4 py-3 border border-border rounded-lg bg-bg text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
              minLength={10}
            />
            <p className="mt-1 text-sm text-text-sub">
              {editContent.length}자 / 최소 10자 이상
            </p>
          </div>
          {updateError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {updateError instanceof Error
                ? updateError.message
                : "리뷰 수정 중 오류가 발생했습니다."}
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="md" onClick={onCancelEdit}>
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={
                isUpdatePending || !editContent.trim() || editRating === 0
              }
            >
              {isUpdatePending ? "수정 중..." : "수정 완료"}
            </Button>
          </div>
        </form>
      ) : (
        <div>
          <p className="text-text-main leading-relaxed whitespace-pre-wrap text-lg mb-4">
            {review.content}
          </p>
          {currentUserId && review.user_id === currentUserId && (
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" size="sm" onClick={onStartEdit}>
                수정
              </Button>
              <Button
                    variant="danger"
                    size="sm"
                    disabled={isDeletePending}
                    onClick={onDelete}
                  >
                    {isDeletePending ? "삭제 중..." : "삭제"}
                  </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
