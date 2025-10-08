import { NextRequest, NextResponse } from "next/server";
import { PromotionService } from "@/services/promotion/promotion.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const daysAgo = parseInt(searchParams.get("daysAgo") || "0");

    const { data, error } = await PromotionService.fetchPopularPromotions(
      limit + offset,
      daysAgo
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // offset부터 limit만큼 슬라이스
    const paginatedData = data?.slice(offset, offset + limit) || [];

    return NextResponse.json({
      data: paginatedData,
      hasMore: data ? offset + limit < data.length : false,
    });
  } catch (error) {
    console.error("Error fetching popular promotions:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular promotions" },
      { status: 500 }
    );
  }
}
