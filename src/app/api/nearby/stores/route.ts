import { NextResponse } from "next/server";
import {
  BrandType,
  BRAND_KEYWORDS,
  KakaoSearchResponse,
  Store,
} from "@/types/store";

const KAKAO_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

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
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    console.error("KAKAO_REST_API_KEY not configured");
    return NextResponse.json(
      { error: "Kakao API key not configured" },
      { status: 500 }
    );
  }

  try {
    // 검색할 브랜드 결정
    const brandsToSearch: BrandType[] =
      brand && brand !== "ALL"
        ? [brand]
        : ["GS25", "CU", "SevenEleven", "Emart24"];

    // 각 브랜드별로 API 호출
    const results = await Promise.all(
      brandsToSearch.map(async (brandType) => {
        const keyword = BRAND_KEYWORDS[brandType];
        const url = `${KAKAO_API_URL}?query=${encodeURIComponent(
          keyword
        )}&x=${longitude}&y=${latitude}&radius=${radius}&size=15&sort=distance`;

        const response = await fetch(url, {
          headers: {
            Authorization: `KakaoAK ${apiKey}`,
          },
        });

        if (!response.ok) {
          console.error(
            `Kakao API error for ${brandType}:`,
            response.statusText
          );
          return [];
        }

        const data: KakaoSearchResponse = await response.json();
        console.log("data", data);
        console.log("data.documents", data.documents);

        // 카카오 응답을 Store 타입으로 변환
        return data.documents.map((place) => ({
          id: place.id,
          name: place.place_name,
          brand: brandType,
          address: place.address_name,
          roadAddress: place.road_address_name,
          distance: parseInt(place.distance || "0", 10),
          latitude: parseFloat(place.y),
          longitude: parseFloat(place.x),
          phone: place.phone || undefined,
          placeUrl: place.place_url,
        })) as Store[];
      })
    );

    // 모든 결과 합치고 거리순 정렬
    const allStores = results.flat().sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      stores: allStores,
      total: allStores.length,
    });
  } catch (error) {
    console.error("Nearby stores API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearby stores" },
      { status: 500 }
    );
  }
}
