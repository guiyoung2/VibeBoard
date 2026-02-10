import { Link } from "react-router-dom";
import { useThemeStore } from "../stores/themeStore";

interface ErrorMessageWithRetryProps {
  /** 메인 안내 문구 */
  message: string;
  /** 상세 메시지 (예: error.message) */
  detail?: string;
  /** 다시 시도 클릭 시 호출 */
  onRetry?: () => void;
  /** 재시도 버튼 텍스트 */
  retryLabel?: string;
  /** 보조 링크 (예: 목록으로) */
  secondaryLink?: { to: string; label: string };
  /** 래퍼 추가 클래스 */
  className?: string;
  /** 버튼 크기 (sm: 프로필 등 좁은 영역) */
  size?: "default" | "sm";
}

export function ErrorMessageWithRetry({
  message,
  detail,
  onRetry,
  retryLabel = "다시 시도",
  secondaryLink,
  className = "",
  size = "default",
}: ErrorMessageWithRetryProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const buttonClass = size === "sm"
    ? "px-4 py-2 rounded-lg text-white text-sm font-medium"
    : "px-4 py-2 rounded-lg text-white font-medium";
  const primaryClass = `${buttonClass} ${isDark ? "bg-accent hover:bg-accent-hover" : "bg-primary hover:bg-primary-soft"}`;

  return (
    <div
      className={`rounded-xl p-6 border border-border bg-bg-card text-center ${className}`}
      role="alert"
    >
      <p className="text-text-main font-medium mb-2">{message}</p>
      {detail && (
        <p className="text-text-sub text-sm mb-4">{detail}</p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={primaryClass}
          >
            {retryLabel}
          </button>
        )}
        {secondaryLink && (
          <Link
            to={secondaryLink.to}
            className={`${size === "sm" ? "px-4 py-2 text-sm" : "px-4 py-2"} rounded-lg border border-border text-text-main hover:bg-bg-muted inline-block font-medium`}
          >
            {secondaryLink.label}
          </Link>
        )}
      </div>
    </div>
  );
}
