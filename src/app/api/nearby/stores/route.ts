import { NextResponse } from "next/server";
import { BrandType, BRAND_KEYWORDS, Store } from "@/types/store";

const NAVER_API_URL = "https://openapi.naver.com/v1/search/local.json";

interface NaverPlace {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string; // 경도 (KATECH 좌표계)
  mapy: string; // 위도 (KATECH 좌표계)
}

interface NaverSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverPlace[];
}

// 카텍 좌표를 WGS84 좌표로 변환 (네이버 지도 좌표계)
function convertKATECHtoWGS84(x: number, y: number) {
  // 네이버 맵 좌표는 EPSG:5179 (KATECH 좌표계)
  // WGS84로 근사 변환
  const longitude = x / 10000000;
  const latitude = y / 10000000;

  return { longitude, latitude };
}

// 두 좌표 간 거리 계산 (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 미터 단위
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const radius = searchParams.get("radius") || "1000"; // 기본 1km
  const brand = searchParams.get("brand") as BrandType | "ALL";

  // 필수 파라미터 검증
  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "latitude and longitude are required" },
      { status: 400 }
    );
  }

  // API 키 확인
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("NAVER_CLIENT_ID or NAVER_CLIENT_SECRET not configured");
    return NextResponse.json(
      { error: "Naver API key not configured" },
      { status: 500 }
    );
  }

  try {
    console.log("🔍 API Request:", { latitude, longitude, radius, brand });

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
    // const radiusNum = parseInt(radius, 10); // 현재 미사용 (거리 필터링 비활성화)

    // 검색할 브랜드 결정
    const brandsToSearch: BrandType[] =
      brand && brand !== "ALL"
        ? [brand]
        : ["GS25", "CU", "SevenEleven", "Emart24"];

    console.log("🏪 Brands to search:", brandsToSearch);

    // 각 브랜드별로 API 호출
    const results = await Promise.all(
      brandsToSearch.map(async (brandType) => {
        const keyword = BRAND_KEYWORDS[brandType];
        const url = `${NAVER_API_URL}?query=${encodeURIComponent(
          keyword
        )}&display=15&sort=random`;

        console.log(`📍 Calling Naver API for ${brandType}:`, keyword);

        const response = await fetch(url, {
          headers: {
            "X-Naver-Client-Id": clientId,
            "X-Naver-Client-Secret": clientSecret,
          },
        });

        if (!response.ok) {
          console.error(
            `❌ Naver API error for ${brandType}:`,
            response.status,
            response.statusText
          );
          const errorBody = await response.text();
          console.error("Error body:", errorBody);
          return [];
        }

        const data: NaverSearchResponse = await response.json();
        console.log(`✅ ${brandType} response:`, {
          total: data.total,
          returned: data.items.length,
        });

        // 첫 번째 결과 상세 로그 (디버깅용)
        if (data.items.length > 0) {
          console.log(`📍 ${brandType} first item:`, {
            title: data.items[0].title,
            mapx: data.items[0].mapx,
            mapy: data.items[0].mapy,
            address: data.items[0].address,
          });
        }

        // 네이버 응답을 Store 타입으로 변환
        const stores = data.items
          .map((place) => {
            // KATECH 좌표를 WGS84로 변환
            const coords = convertKATECHtoWGS84(
              parseInt(place.mapx),
              parseInt(place.mapy)
            );

            // 거리 계산
            const distance = calculateDistance(
              userLat,
              userLon,
              coords.latitude,
              coords.longitude
            );

            // 일단 모든 결과 포함 (거리 필터링 제거)
            // TODO: 정확한 좌표 변환 후 필터링 추가

            // HTML 태그 제거
            const cleanTitle = place.title.replace(/<[^>]*>/g, "");

            return {
              id: `${brandType}-${place.mapx}-${place.mapy}`,
              name: cleanTitle,
              brand: brandType,
              address: place.address,
              roadAddress: place.roadAddress || place.address,
              distance: Math.round(distance),
              latitude: coords.latitude,
              longitude: coords.longitude,
              phone: place.telephone || undefined,
              placeUrl: place.link,
            } as Store;
          })
          .filter((store): store is Store => store !== null);

        return stores;
      })
    );

    // 모든 결과 합치고 거리순 정렬
    const allStores = results.flat().sort((a, b) => a.distance - b.distance);

    console.log("✅ Total stores found:", allStores.length);
    console.log("Stores:", allStores.map((s) => `${s.brand} - ${s.name}`));

    return NextResponse.json({
      success: true,
      stores: allStores,
      total: allStores.length,
    });
  } catch (error) {
    console.error("❌ Nearby stores API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby stores" },
      { status: 500 }
    );
  }
}
