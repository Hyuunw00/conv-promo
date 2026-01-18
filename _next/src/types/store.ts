/**
 * 편의점 매장 타입 정의
 */

export type BrandType = "GS25" | "CU" | "SevenEleven" | "Emart24";

export interface Store {
  id: string; // 카카오 place_id
  name: string; // 매장명
  brand: BrandType; // 브랜드
  address: string; // 도로명 주소
  roadAddress?: string; // 지번 주소
  distance: number; // 거리 (미터)
  latitude: number; // 위도
  longitude: number; // 경도
  phone?: string; // 전화번호
  placeUrl?: string; // 카카오맵 URL
}

export interface KakaoSearchResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도
  y: string; // 위도
  place_url: string;
  distance: string;
}

/**
 * 브랜드별 마커 색상
 */
export const BRAND_COLORS: Record<BrandType, string> = {
  GS25: "#0066FF", // 파랑
  CU: "#00A651", // 초록
  SevenEleven: "#E30613", // 빨강
  Emart24: "#FFC72C", // 노랑
};

/**
 * 카카오 API 검색 키워드
 */
export const BRAND_KEYWORDS: Record<BrandType, string> = {
  GS25: "GS25",
  CU: "CU",
  SevenEleven: "세븐일레븐",
  Emart24: "이마트24",
};

/**
 * 브랜드명 한글 표시
 */
export const BRAND_LABELS: Record<BrandType, string> = {
  GS25: "GS25",
  CU: "CU",
  SevenEleven: "세븐일레븐",
  Emart24: "이마트24",
};
