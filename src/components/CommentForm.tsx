import { useThemeStore } from "../stores/themeStore";

interface CommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: Error | null;
  isPending: boolean;
  submitLabel?: string;
  placeholder?: string;
  rows?: number;
}

export function CommentForm({
  value,
  onChange,
  onSubmit,
  error,
  isPending,
  submitLabel = "댓글 작성",
  placeholder = "댓글을 작성해주세요...",
  rows = 4,
}: CommentFormProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <form onSubmit={onSubmit} className="mb-8">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 border border-border rounded-lg bg-bg text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
        disabled={isPending}
      />
      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">
          {error instanceof Error ? error.message : "댓글 작성 중 오류가 발생했습니다."}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !value.trim()}
          className={`${isDark ? "bg-accent hover:bg-accent-hover" : "bg-primary hover:bg-primary/90"} text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPending ? "작성 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
