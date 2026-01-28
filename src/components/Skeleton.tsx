/** 기본 스켈레톤 블록 (테마 변수 사용) */
export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden />;
}

/** 게임 카드 그리드용 스켈레톤 (GameCard와 동일 레이아웃) */
export function SkeletonGameCard() {
  return (
    <div className="bg-bg-card p-6 rounded-lg shadow-card border border-border">
      <Skeleton className="w-full aspect-square mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-14 rounded-md" />
      </div>
    </div>
  );
}

/** 게임 목록 그리드 스켈레톤 (카드 6개) */
export function SkeletonGameGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonGameCard key={i} />
      ))}
    </div>
  );
}

/** 리뷰 목록 한 행 스켈레톤 (Reviews 페이지용) */
export function SkeletonReviewRow() {
  return (
    <div className="bg-bg-card p-6 rounded-xl shadow-card border border-border">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-20 mb-1" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-12 h-12 rounded" />
        <Skeleton className="h-5 w-28" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

/** 리뷰 목록 스켈레톤 (3행) */
export function SkeletonReviewList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonReviewRow key={i} />
      ))}
    </div>
  );
}

/** 상세 페이지 스켈레톤 (GameDetail / ReviewDetail) */
export function SkeletonDetail() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Skeleton className="h-5 w-24 mb-6" />
      <div className="bg-bg-card p-8 rounded-lg shadow-card border border-border">
        <Skeleton className="w-full max-w-xl mx-auto aspect-video rounded-lg mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 히어로 슬라이더 스켈레톤 */
export function SkeletonHero() {
  return (
    <div className="relative w-full aspect-[21/9] max-h-[400px] rounded-xl overflow-hidden bg-bg-card border border-border">
      <Skeleton className="absolute inset-0 rounded-xl" />
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
        <Skeleton className="h-2 w-8 rounded-full" />
        <Skeleton className="h-2 w-8 rounded-full" />
        <Skeleton className="h-2 w-8 rounded-full" />
        <Skeleton className="h-2 w-8 rounded-full" />
      </div>
    </div>
  );
}

/** 댓글 한 줄 스켈레톤 */
export function SkeletonCommentRow() {
  return (
    <div className="p-4 bg-bg rounded-lg border border-border">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

/** 댓글 목록 스켈레톤 */
export function SkeletonCommentList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCommentRow key={i} />
      ))}
    </div>
  );
}
