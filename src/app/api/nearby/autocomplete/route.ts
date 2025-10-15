import { NextRequest, NextResponse } from "next/server";

/**
 * Naver Local Search API - 지역 검색 (자동완성용)
 * GET /api/nearby/autocomplete?query=강남역
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { success: false, error: "Query parameter is required" },
      { status: 400 }
    );
  }

  const CLIENT_ID = process.env.NAVER_SEARCH_CLIENT_ID;
  const CLIENT_SECRET = process.env.NAVER_SEARCH_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("NAVER_SEARCH_CLIENT_ID or CLIENT_SECRET is not set");
    return NextResponse.json(
      { success: false, error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const naverResponse = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
        query
      )}&display=5&sort=random`,
      {
        headers: {
          "X-Naver-Client-Id": CLIENT_ID,
          "X-Naver-Client-Secret": CLIENT_SECRET,
        },
      }
    );

    if (!naverResponse.ok) {
      const errorText = await naverResponse.text();
      console.error("Naver API error:", naverResponse.status, errorText);
      throw new Error(`Naver API request failed: ${naverResponse.status}`);
    }

    const data = await naverResponse.json();

    // 검색 결과를 자동완성 형식으로 변환
    const suggestions = data.items.map((place: any) => ({
      placeName: place.title.replace(/<[^>]*>/g, ""), // HTML 태그 제거
      addressName: place.address,
      roadAddressName: place.roadAddress || place.address,
      x: parseFloat(place.mapx) / 10000000, // 경도 (네이버는 10^7 단위로 제공)
      y: parseFloat(place.mapy) / 10000000, // 위도
      category: place.category,
    }));

    return NextResponse.json({
      success: true,
      suggestions,
      total: data.total,
    });
  } catch (error) {
    console.error("Naver autocomplete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
