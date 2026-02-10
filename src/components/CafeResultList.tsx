import type { RefObject } from "react";
import { useThemeStore } from "../stores/themeStore";
import type { KakaoPlace } from "../types/kakao";

interface CafeResultListProps {
  places: KakaoPlace[];
  pageableCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNum: number) => void;
  loading: boolean;
  loadingPage: boolean;
  loadingTargetPage: number | null;
  resultsListRef: RefObject<HTMLDivElement | null>;
  hasSearchCenter: boolean;
}

export function CafeResultList({
  places,
  pageableCount,
  currentPage,
  totalPages,
  onPageChange,
  loading,
  loadingPage,
  loadingTargetPage,
  resultsListRef,
  hasSearchCenter,
}: CafeResultListProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <div
      ref={resultsListRef}
      className="bg-bg-card rounded-xl border border-border p-4 max-h-[500px] overflow-y-auto"
    >
      <h2 className="text-lg font-bold text-text-main mb-2">
        검색 결과
        {pageableCount > 0
          ? ` (총 ${pageableCount}곳, ${currentPage}/${totalPages}페이지)`
          : ""}
      </h2>
      {places.length > 0 && (
        <p className="text-xs text-text-muted mb-4">
          지도에서 마커·이름을 클릭하면 카카오맵 상세로 이동합니다. 일부 결과는
          대략적인 위치일 수 있습니다.
        </p>
      )}
      {places.length === 0 && !loading && (
        <p className="text-text-sub text-sm">
          역 이름·동 이름(예: 중앙역 4호선)을 입력 후 &quot;검색어로 검색&quot;을
          누르거나, &quot;현재 위치에서 검색&quot;으로 주변 보드게임 카페를
          찾아보세요.
        </p>
      )}
      <ul className="space-y-3">
        {places.map((place) => (
          <li key={place.id}>
            <a
              href={place.place_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg border border-border hover:shadow-hover transition-shadow bg-bg"
            >
              <p className="font-semibold text-text-main truncate">
                {place.place_name}
              </p>
              <p className="text-sm text-text-sub mt-1 line-clamp-2">
                {place.road_address_name || place.address_name}
              </p>
              {place.distance && (
                <p className="text-xs text-text-muted mt-1">
                  검색 기준 위치에서 약{" "}
                  {(parseInt(place.distance, 10) / 1000).toFixed(1)}km
                </p>
              )}
              {place.phone && (
                <p className="text-xs text-text-muted mt-0.5">{place.phone}</p>
              )}
            </a>
          </li>
        ))}
      </ul>
      {totalPages > 1 && hasSearchCenter && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                disabled={loadingPage}
                className={`min-w-[2.5rem] py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  pageNum === currentPage
                    ? isDark
                      ? "bg-accent text-white"
                      : "bg-primary text-white"
                    : "border border-border text-text-main hover:bg-bg-muted"
                }`}
              >
                {loadingPage && pageNum === loadingTargetPage
                  ? "..."
                  : pageNum}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
