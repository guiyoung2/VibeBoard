import type { KakaoKeywordSearchResponse, KakaoPlace } from "../types/kakao";

const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

const PAGE_SIZE = 15;

export interface SearchKeywordResult {
  documents: KakaoPlace[];
  isEnd: boolean;
  /** API가 반환 가능한 전체 건수 (최대 45) */
  pageableCount: number;
}

/**
 * Kakao Local API - 키워드로 장소 검색
 * @param query 검색 키워드 (예: "보드게임카페")
 * @param lng 경도 (x) - 현재 위치 기준 검색 시 필수
 * @param lat 위도 (y) - 현재 위치 기준 검색 시 필수
 * @param radius 반경 미터 (0~20000, 기본 5000)
 * @param sort accuracy | distance (distance 시 x,y 필수)
 * @param page 페이지 번호 (1부터, 더 보기용)
 */
export async function searchKeyword(
  query: string,
  lng: number,
  lat: number,
  radius: number = 5000,
  sort: "accuracy" | "distance" = "distance",
  page: number = 1,
): Promise<SearchKeywordResult> {
  if (!REST_API_KEY) {
    throw new Error("VITE_KAKAO_REST_API_KEY가 설정되지 않았습니다.");
  }

  const params = new URLSearchParams({
    query,
    x: String(lng),
    y: String(lat),
    radius: String(Math.min(radius, 20000)),
    sort,
    size: String(PAGE_SIZE),
    page: String(Math.max(1, page)),
  });

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`,
    {
      headers: {
        Authorization: `KakaoAK ${REST_API_KEY}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kakao API 오류: ${res.status} ${text}`);
  }

  const data: KakaoKeywordSearchResponse = await res.json();
  return {
    documents: data.documents ?? [],
    isEnd: data.meta?.is_end ?? true,
    pageableCount: data.meta?.pageable_count ?? 0,
  };
}

/**
 * Kakao Local API - 키워드만으로 장소 검색 (좌표 없이)
 * 검색어 기준 위치를 얻을 때 사용 (예: "중앙역 4호선" → 첫 결과의 좌표)
 */
export async function searchKeywordOnly(
  query: string,
  size: number = 1,
): Promise<KakaoPlace[]> {
  if (!REST_API_KEY) {
    throw new Error("VITE_KAKAO_REST_API_KEY가 설정되지 않았습니다.");
  }

  const params = new URLSearchParams({
    query: query.trim(),
    size: String(Math.min(Math.max(size, 1), 15)),
  });

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`,
    {
      headers: {
        Authorization: `KakaoAK ${REST_API_KEY}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kakao API 오류: ${res.status} ${text}`);
  }

  const data: KakaoKeywordSearchResponse = await res.json();
  return data.documents ?? [];
}

export function hasKakaoRestKey(): boolean {
  return Boolean(import.meta.env.VITE_KAKAO_REST_API_KEY);
}

export function hasKakaoJsKey(): boolean {
  return Boolean(import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY);
}
