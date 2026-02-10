import { useState, useRef, useMemo, useEffect, useCallback } from "react";

export interface UseInfiniteDisplayOptions {
  /** 한 번에 추가로 로드할 개수 */
  pageSize?: number;
  /** 초기 표시 개수 */
  initialSize?: number;
}

/**
 * 목록을 일부만 보여주고, 뷰포트 하단 도달 시 더 보기 (IntersectionObserver).
 * Games, Reviews 등 "더 보기" 무한 스크롤 공통 로직.
 */
export function useInfiniteDisplay<T>(
  items: T[],
  options: UseInfiniteDisplayOptions = {},
): {
  slicedItems: T[];
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  hasMore: boolean;
  prevDisplayCount: number;
  /** 표시 개수 리셋. 인자 없으면 initialSize, 있으면 해당 개수로 */
  reset: (toCount?: number) => void;
} {
  const pageSize = options.pageSize ?? 3;
  const initialSize = options.initialSize ?? pageSize;

  const [displayCount, setDisplayCount] = useState(initialSize);
  const [prevDisplayCount, setPrevDisplayCount] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const slicedItems = useMemo(
    () => items.slice(0, displayCount),
    [items, displayCount],
  );
  const hasMore = displayCount < items.length;

  const reset = useCallback((toCount?: number) => {
    setPrevDisplayCount(0);
    setDisplayCount(toCount ?? initialSize);
  }, [initialSize]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        setDisplayCount((prev) => {
          setPrevDisplayCount(prev);
          return Math.min(prev + pageSize, items.length);
        });
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [hasMore, items.length, pageSize]);

  return {
    slicedItems,
    loadMoreRef,
    hasMore,
    prevDisplayCount,
    reset,
  };
}
