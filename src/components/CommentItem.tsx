import type { Comment } from "../types/review";
import { useThemeStore } from "../stores/themeStore";

interface CommentItemProps {
  comment: Comment;
  currentUserId: string | undefined;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (e: React.FormEvent) => void;
  onDelete: () => void;
  updateError: Error | null;
  isUpdatePending: boolean;
  isDeletePending: boolean;
}

export function CommentItem({
  comment,
  currentUserId,
  isEditing,
  editContent,
  onEditContentChange,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  updateError,
  isUpdatePending,
  isDeletePending,
}: CommentItemProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <div className="p-4 bg-bg rounded-lg border border-border">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-primary dark:text-text-main font-semibold">
            {comment.profile?.nickname?.[0] || "U"}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-main">
                {comment.profile?.nickname || "익명 사용자"}
              </h3>
              <p className="text-sm text-text-sub">
                {new Date(comment.created_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {currentUserId &&
              comment.user_id === currentUserId &&
              !isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={onStartEdit}
                    className="text-xs text-text-sub hover:text-text-main transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={onDelete}
                    disabled={isDeletePending}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              )}
          </div>
          {isEditing ? (
            <form onSubmit={onUpdate} className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => onEditContentChange(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              />
              {updateError && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                  <p className="font-semibold mb-1">댓글 수정 실패</p>
                  <p>
                    {updateError instanceof Error
                      ? updateError.message
                      : "댓글 수정 중 오류가 발생했습니다."}
                  </p>
                  <p className="mt-1 text-red-500">
                    Supabase RLS 정책을 확인해주세요.
                  </p>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-3 py-1 text-xs border border-border rounded text-text-main hover:bg-bg-muted transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUpdatePending || !editContent.trim()}
                  className={`px-3 py-1 text-xs ${isDark ? "bg-accent hover:bg-accent-hover" : "bg-primary hover:bg-primary-soft"} text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isUpdatePending ? "수정 중..." : "수정 완료"}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-text-main leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
