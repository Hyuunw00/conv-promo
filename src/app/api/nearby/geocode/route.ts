import { NextResponse } from "next/server";

// 네이버 검색 API (지명, 랜드마크 검색)
const NAVER_SEARCH_URL = "https://openapi.naver.com/v1/search/local.json";

// NCP Geocoding API (주소 검색)
const NAVER_GEOCODING_URL =
  "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";

interface NaverPlace {
  title: string;
  address: string;
  roadAddress: string;
  mapx: string; // 경도 (KATECH 좌표계)
  mapy: string; // 위도 (KATECH 좌표계)
}

interface NaverSearchResponse {
  total: number;
  items: NaverPlace[];
}

interface GeocodeAddress {
  roadAddress: string;
  jibunAddress: string;
  x: string; // 경도
  y: string; // 위도
}

interface GeocodeResponse {
  status: string;
  meta: {
    totalCount: number;
    page: number;
    count: number;
  };
  addresses: GeocodeAddress[];
}

// KATECH 좌표를 WGS84 좌표로 변환
function convertKATECHtoWGS84(x: number, y: number) {
  const longitude = x / 10000000;
  const latitude = y / 10000000;
  return { longitude, latitude };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  // 필수 파라미터 검증
  if (!query) {
    return NextResponse.json(
      { error: "query parameter is required" },
      { status: 400 }
    );
  }

  // API 키 확인
  const ncpClientId = process.env.NEXT_PUBLIC_NCP_MAPS_CLIENT_ID;
  const ncpClientSecret = process.env.NCP_MAPS_CLIENT_SECRET;
  const searchClientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const searchClientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;

  if (!ncpClientId || !ncpClientSecret) {
    console.error("NCP Maps API key not configured");
    return NextResponse.json(
      { error: "NCP Maps API key not configured" },
      { status: 500 }
    );
  }

  if (!searchClientId || !searchClientSecret) {
    console.error("Naver Search API key not configured");
    return NextResponse.json(
      { error: "Naver Search API key not configured" },
      { status: 500 }
    );
  }

  try {
    console.log("🔍 Geocoding request:", query);

    // 1. 먼저 네이버 검색 API로 시도 (지명, 랜드마크)
    const searchUrl = `${NAVER_SEARCH_URL}?query=${encodeURIComponent(
      query
    )}&display=1`;

    const searchResponse = await fetch(searchUrl, {
      headers: {
        "X-Naver-Client-Id": searchClientId,
        "X-Naver-Client-Secret": searchClientSecret,
      },
    });

    if (searchResponse.ok) {
      const searchData: NaverSearchResponse = await searchResponse.json();

      if (searchData.total > 0 && searchData.items.length > 0) {
        const place = searchData.items[0];
        const coords = convertKATECHtoWGS84(
          parseInt(place.mapx),
          parseInt(place.mapy)
        );

        console.log("✅ Search API found:", place.title);

        return NextResponse.json({
          success: true,
          latitude: coords.latitude,
          longitude: coords.longitude,
          roadAddress: place.roadAddress || place.address,
          jibunAddress: place.address,
        });
      }
    }

    // 2. 검색 API에서 결과가 없으면 Geocoding API로 시도 (주소)
    console.log("🔍 Trying Geocoding API for address...");

    const geocodeUrl = `${NAVER_GEOCODING_URL}?query=${encodeURIComponent(
      query
    )}`;

    const geocodeResponse = await fetch(geocodeUrl, {
      headers: {
        "x-ncp-apigw-api-key-id": ncpClientId,
        "x-ncp-apigw-api-key": ncpClientSecret,
        Accept: "application/json",
      },
    });

    if (!geocodeResponse.ok) {
      const errorText = await geocodeResponse.text();
      console.error(
        "❌ Geocoding API error:",
        geocodeResponse.status,
        errorText
      );
      return NextResponse.json(
        { error: "No results found for the given query" },
        { status: 404 }
      );
    }

    const geocodeData: GeocodeResponse = await geocodeResponse.json();

    console.log("✅ Geocoding response:", {
      status: geocodeData.status,
      totalCount: geocodeData.meta.totalCount,
    });

    // 결과가 없는 경우
    if (
      geocodeData.meta.totalCount === 0 ||
      geocodeData.addresses.length === 0
    ) {
      return NextResponse.json(
        { error: "No results found for the given query" },
        { status: 404 }
      );
    }

    // 첫 번째 결과 반환
    const firstResult = geocodeData.addresses[0];

    return NextResponse.json({
      success: true,
      latitude: parseFloat(firstResult.y),
      longitude: parseFloat(firstResult.x),
      roadAddress: firstResult.roadAddress,
      jibunAddress: firstResult.jibunAddress,
    });
  } catch (error) {
    console.error("❌ Geocoding API error:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}
