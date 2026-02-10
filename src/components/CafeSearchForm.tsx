import { Button } from "./Button";

interface CafeSearchFormProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchByQuery: () => void;
  onSearchByCurrentLocation: () => void;
  loading: boolean;
}

export function CafeSearchForm({
  searchQuery,
  onSearchQueryChange,
  onSearchByQuery,
  onSearchByCurrentLocation,
  loading,
}: CafeSearchFormProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearchByQuery()}
          placeholder="예: 중앙역 4호선, 강남역, 홍대입구"
          className="flex-1 min-w-0 px-4 py-3 border border-border rounded-xl bg-bg-card text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={loading}
          className="shrink-0"
          onClick={onSearchByQuery}
        >
          {loading ? "검색 중..." : "검색어로 검색"}
        </Button>
      </div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={loading}
        className="shrink-0"
        onClick={onSearchByCurrentLocation}
      >
        현재 위치에서 검색
      </Button>
    </div>
  );
}
