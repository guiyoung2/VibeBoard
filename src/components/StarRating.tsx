/**
 * 평점 표시·선택 공통 컴포넌트
 * - 표시 모드: value만 전달 → ⭐ 개수로 표시
 * - 선택 모드: onChange 전달 → 클릭으로 1~5 선택
 */
interface StarRatingProps {
  /** 0~5 (0이면 빈 별) */
  value: number;
  /** 있으면 선택 가능 모드 */
  onChange?: (rating: number) => void;
  /** 선택 모드에서 "n점" 텍스트 표시 여부 */
  showScore?: boolean;
  /** 표시 모드에서 사용할 클래스 (별 크기 등) */
  className?: string;
}

export function StarRating({
  value,
  onChange,
  showScore = false,
  className = "",
}: StarRatingProps) {
  const editable = typeof onChange === "function";

  // 표시 전용 (읽기 전용)
  if (!editable) {
    return (
      <span className={`inline-block text-2xl ${className}`} aria-hidden>
        {"⭐".repeat(Math.min(5, Math.max(0, value)))}
      </span>
    );
  }

  // 선택 가능 (버튼)
  return (
    <div className={`flex gap-1 items-center ${className}`}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="w-12 h-12 flex items-center justify-center text-4xl transition-all hover:scale-110 cursor-pointer"
          title={`${rating}점`}
          aria-label={`${rating}점`}
        >
          {value >= rating ? (
            <span className="text-yellow-400">⭐</span>
          ) : (
            <span className="text-gray-400 dark:text-text-muted">☆</span>
          )}
        </button>
      ))}
      {showScore && value > 0 && (
        <span className="ml-4 text-lg font-semibold text-text-main">
          {value}점
        </span>
      )}
    </div>
  );
}
