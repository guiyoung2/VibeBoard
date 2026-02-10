import { useState, useRef, useEffect, useCallback } from "react";
import {
  searchKeyword,
  searchKeywordOnly,
  hasKakaoRestKey,
} from "../lib/kakao";
import { useKakaoMapScript } from "../hooks/useKakaoMapScript";
import { escapeHtml } from "../utils/string";
import type { KakaoPlace } from "../types/kakao";
import { CafeMap } from "../components/CafeMap";
import { CafeResultList } from "../components/CafeResultList";
import { CafeSearchForm } from "../components/CafeSearchForm";

const KAKAO_KEYWORD = "보드게임카페";
const DEFAULT_RADIUS = 5000; // 5km
const PAGE_SIZE = 15; // 카카오 API 1페이지당 최대 15건, 전체 최대 45건(3페이지)

function Cafes() {
  const { mapReady, error: scriptError } = useKakaoMapScript();
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const overlaysRef = useRef<unknown[]>([]);
  const resultsListRef = useRef<HTMLDivElement>(null);

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

        <CafeSearchForm
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearchByQuery={handleSearchByQuery}
          onSearchByCurrentLocation={handleSearchByCurrentLocation}
          loading={loading}
        />

        {(error || scriptError) && (
          <div className="mb-6 p-4 rounded-xl border border-border bg-bg-card text-text-main">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {error || scriptError}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CafeMap mapContainerRef={mapContainerRef} />
          </div>
          <CafeResultList
            places={places}
            pageableCount={pageableCount}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
            loadingPage={loadingPage}
            loadingTargetPage={loadingTargetPage}
            resultsListRef={resultsListRef}
            hasSearchCenter={!!searchCenter}
          />
        </div>
      </div>
    </div>
  );
}

export default Cafes;
