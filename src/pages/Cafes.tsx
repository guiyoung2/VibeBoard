import { useState, useRef, useEffect, useCallback } from "react";
import { useThemeStore } from "../stores/themeStore";
import {
  searchKeyword,
  searchKeywordOnly,
  hasKakaoRestKey,
  hasKakaoJsKey,
} from "../lib/kakao";
import type { KakaoPlace } from "../types/kakao";

const KAKAO_KEYWORD = "보드게임카페";
const DEFAULT_RADIUS = 5000; // 5km
const PAGE_SIZE = 15; // 카카오 API 1페이지당 최대 15건, 전체 최대 45건(3페이지)
const JS_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function Cafes() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  /** 검색 기준 좌표 (현재 위치 또는 검색어로 찾은 장소) */
  const [searchCenter, setSearchCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadingTargetPage, setLoadingTargetPage] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageableCount, setPageableCount] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const overlaysRef = useRef<unknown[]>([]);
  const resultsListRef = useRef<HTMLDivElement>(null);

  // Kakao Maps 스크립트 로드 (JavaScript 키 있을 때만)
  useEffect(() => {
    if (!JS_KEY || !hasKakaoJsKey()) return;
    if (window.kakao?.maps) {
      setMapReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${JS_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      const k = window.kakao;
      if (k?.maps?.load) {
        k.maps.load(() => setMapReady(true));
      } else if (k?.maps) {
        setMapReady(true);
      }
    };
    script.onerror = () => {
      setError("지도 스크립트를 불러오지 못했습니다.");
    };
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  // 지도 생성 및 마커 표시 (컨테이너 레이아웃 후 실행)
  const initMap = useCallback(
    (lat: number, lng: number, placeList: KakaoPlace[]) => {
      const container = mapContainerRef.current;
      if (!container || !window.kakao?.maps || !mapReady) return;

      const tryCreate = () => {
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          requestAnimationFrame(tryCreate);
          return;
        }
        const k = window.kakao?.maps;
        if (!k) return;
        const kakao = k;
        const center = new kakao.LatLng(lat, lng);
        const map = new kakao.Map(container, {
          center,
          level: 5,
        });
        mapInstanceRef.current = map;

        // 기존 오버레이 제거
        overlaysRef.current.forEach((o) =>
          (o as { setMap: (map: unknown) => void }).setMap(null),
        );
        overlaysRef.current = [];

        // 검색 결과: 매장 이름만 표시 (현재 위치 마커 없음, 이름 라벨만)
        placeList.forEach((place) => {
          const lat = parseFloat(place.y);
          const lng = parseFloat(place.x);
          if (Number.isNaN(lat) || Number.isNaN(lng)) return;

          const pos = new kakao.LatLng(lat, lng);
          const placeUrl = place.place_url || "#";

          const openPlace = () => {
            if (placeUrl !== "#") window.open(placeUrl, "_blank");
          };

          try {
            // 이름 라벨만 표시 (핀 마커 없음)
            const labelEl = document.createElement("div");
            labelEl.className = "kakao-marker-label";
            labelEl.innerHTML = `<span class="kakao-marker-label__text">${escapeHtml(place.place_name)}</span>`;
            labelEl.style.cssText = `
              padding: 6px 10px; background: #fff; border-radius: 8px;
              font-size: 13px; font-weight: 600; white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 1px solid #e5e7eb;
              cursor: pointer; user-select: none;
              transition: background 0.15s, box-shadow 0.15s;
            `;
            labelEl.addEventListener("mouseenter", () => {
              labelEl.style.background = "#f8fafc";
              labelEl.style.boxShadow = "0 3px 12px rgba(0,0,0,0.2)";
            });
            labelEl.addEventListener("mouseleave", () => {
              labelEl.style.background = "#fff";
              labelEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
            });
            labelEl.addEventListener("click", (e) => {
              e.stopPropagation();
              openPlace();
            });

            const overlay = new kakao.CustomOverlay({
              position: pos,
              content: labelEl,
              yAnchor: 1.2,
            });
            overlay.setMap(map);
            overlaysRef.current.push(overlay);
          } catch {
            // 마커/오버레이 생성 실패 시 해당 장소만 스킵
          }
        });
      };
      tryCreate();
    },
    [mapReady],
  );

  // 검색 결과가 있으면 가장 가까운 매장을 지도 중심으로, 없으면 검색 기준 좌표
  const mapCenter = (() => {
    if (places.length === 0 && searchCenter)
      return { lat: searchCenter.lat, lng: searchCenter.lng };
    if (places.length === 0) return null;
    const closest = places.reduce((min, p) => {
      const d = parseInt(p.distance ?? "999999", 10);
      const minD = parseInt(min.distance ?? "999999", 10);
      return d < minD ? p : min;
    });
    return {
      lat: parseFloat(closest.y),
      lng: parseFloat(closest.x),
    };
  })();

  useEffect(() => {
    if (!searchCenter || !mapReady) return;
    const lat = mapCenter?.lat ?? searchCenter.lat;
    const lng = mapCenter?.lng ?? searchCenter.lng;
    initMap(lat, lng, places);
  }, [searchCenter, places, mapReady, initMap, mapCenter?.lat, mapCenter?.lng]);

  const handleSearchByCurrentLocation = () => {
    setError(null);
    setPlaces([]);
    setCurrentPage(1);
    setPageableCount(0);
    setLoading(true);

    if (!navigator.geolocation) {
      setError("이 브라우저는 위치 기능을 지원하지 않습니다.");
      setLoading(false);
      return;
    }

    if (!hasKakaoRestKey()) {
      setError(
        "카카오 REST API 키가 설정되지 않았습니다. .env에 VITE_KAKAO_REST_API_KEY를 추가해주세요.",
      );
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setSearchCenter({ lat, lng });

        try {
          const { documents, pageableCount: count } = await searchKeyword(
            KAKAO_KEYWORD,
            lng,
            lat,
            DEFAULT_RADIUS,
            "distance",
            1,
          );
          setPlaces(documents);
          setCurrentPage(1);
          setPageableCount(count);
          setError(null);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "주변 매장 검색에 실패했습니다.",
          );
          setPlaces([]);
          setPageableCount(0);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(
          err.code === 1
            ? "위치 권한이 거부되었습니다. 브라우저에서 위치 권한을 허용해주세요."
            : "현재 위치를 가져올 수 없습니다.",
        );
        setPlaces([]);
        setPageableCount(0);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleSearchByQuery = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setError("검색어를 입력해주세요.");
      return;
    }
    setError(null);
    setPlaces([]);
    setCurrentPage(1);
    setPageableCount(0);
    setLoading(true);

    if (!hasKakaoRestKey()) {
      setError(
        "카카오 REST API 키가 설정되지 않았습니다. .env에 VITE_KAKAO_REST_API_KEY를 추가해주세요.",
      );
      setLoading(false);
      return;
    }

    try {
      const keywordResults = await searchKeywordOnly(query, 1);
      if (!keywordResults.length) {
        setError(`"${query}"에 대한 장소를 찾을 수 없습니다.`);
        setCurrentPage(1);
        setPageableCount(0);
        setLoading(false);
        return;
      }
      const first = keywordResults[0];
      const lat = parseFloat(first.y);
      const lng = parseFloat(first.x);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        setError("해당 장소의 좌표를 가져올 수 없습니다.");
        setCurrentPage(1);
        setPageableCount(0);
        setLoading(false);
        return;
      }
      setSearchCenter({ lat, lng });

      const { documents, pageableCount: count } = await searchKeyword(
        KAKAO_KEYWORD,
        lng,
        lat,
        DEFAULT_RADIUS,
        "distance",
        1,
      );
      setPlaces(documents);
      setCurrentPage(1);
      setPageableCount(count);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "검색 중 오류가 발생했습니다.",
      );
      setPlaces([]);
      setCurrentPage(1);
      setPageableCount(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(pageableCount / PAGE_SIZE);

  const handlePageChange = async (pageNum: number) => {
    if (!searchCenter || !hasKakaoRestKey() || pageNum === currentPage) return;
    if (pageNum < 1 || pageNum > totalPages) return;
    setLoadingTargetPage(pageNum);
    setLoadingPage(true);
    setError(null);
    try {
      const { documents } = await searchKeyword(
        KAKAO_KEYWORD,
        searchCenter.lng,
        searchCenter.lat,
        DEFAULT_RADIUS,
        "distance",
        pageNum,
      );
      setPlaces(documents);
      setCurrentPage(pageNum);
      resultsListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "해당 페이지를 불러오지 못했습니다.",
      );
    } finally {
      setLoadingPage(false);
      setLoadingTargetPage(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary dark:text-text-main mb-2">
          주변 보드게임 매장 찾기
        </h1>
        <p className="text-text-sub mb-6">
          현재 위치 또는 검색어를 기준으로 주변 보드게임 카페를 검색합니다.
          (검색 후 가장 가까운 매장 중심으로 표시가 됩니다.)
        </p>

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchByQuery()}
              placeholder="예: 중앙역 4호선, 강남역, 홍대입구"
              className="flex-1 min-w-0 px-4 py-3 border border-border rounded-xl bg-bg-card text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleSearchByQuery}
              disabled={loading}
              className={`shrink-0 px-6 py-3 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-accent hover:bg-accent-hover"
                  : "bg-primary hover:bg-primary-soft"
              }`}
            >
              {loading ? "검색 중..." : "검색어로 검색"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleSearchByCurrentLocation}
            disabled={loading}
            className={`shrink-0 px-6 py-3 rounded-xl font-medium border border-border text-text-main hover:bg-bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark ? "border-border" : ""
            }`}
          >
            현재 위치에서 검색
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-border bg-bg-card text-text-main">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 지도 */}
          <div className="lg:col-span-2">
            <div
              ref={mapContainerRef}
              className="w-full h-[400px] rounded-xl border border-border overflow-hidden bg-bg-muted"
            />
          </div>

          {/* 결과 목록 */}
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
                지도에서 마커·이름을 클릭하면 카카오맵 상세로 이동합니다. 일부
                결과는 대략적인 위치일 수 있습니다.
              </p>
            )}
            {places.length === 0 && !loading && (
              <p className="text-text-sub text-sm">
                역 이름·동 이름(예: 중앙역 4호선)을 입력 후 &quot;검색어로
                검색&quot;을 누르거나, &quot;현재 위치에서 검색&quot;으로 주변
                보드게임 카페를 찾아보세요.
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
                      <p className="text-xs text-text-muted mt-0.5">
                        {place.phone}
                      </p>
                    )}
                  </a>
                </li>
              ))}
            </ul>
            {totalPages > 1 && searchCenter && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loadingPage}
                      className={`min-w-[2.5rem] py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        pageNum === currentPage
                          ? isDark
                            ? "bg-accent text-white"
                            : "bg-primary text-white"
                          : "border border-border text-text-main hover:bg-bg-muted " +
                            (isDark ? "border-border" : "")
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
        </div>
      </div>
    </div>
  );
}

export default Cafes;
