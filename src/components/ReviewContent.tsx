import type { Review } from "../types/review";
import { StarRating } from "./StarRating";
import { useThemeStore } from "../stores/themeStore";

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
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

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
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-2 border border-border rounded-lg text-text-main hover:bg-bg-muted transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                isUpdatePending || !editContent.trim() || editRating === 0
              }
              className={`px-6 py-2 ${isDark ? "bg-accent hover:bg-accent-hover" : "bg-primary hover:bg-primary-soft"} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isUpdatePending ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <p className="text-text-main leading-relaxed whitespace-pre-wrap text-lg mb-4">
            {review.content}
          </p>
          {currentUserId && review.user_id === currentUserId && (
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={onStartEdit}
                className="px-4 py-2 text-sm text-text-sub hover:text-text-main transition-colors border border-border rounded-lg hover:bg-bg-muted"
              >
                수정
              </button>
              <button
                onClick={onDelete}
                disabled={isDeletePending}
                className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {isDeletePending ? "삭제 중..." : "삭제"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
