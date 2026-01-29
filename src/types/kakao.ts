/** Kakao Local API - 키워드 검색 결과 문서 */
export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  x: string; // 경도 longitude
  y: string; // 위도 latitude
  place_url: string;
  distance?: string; // 미터 단위, x,y 있을 때만
}

export interface KakaoKeywordSearchResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: KakaoPlace[];
}
