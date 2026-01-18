import { createClient } from "@/lib/supabase/client";
import { getOriginalCategories, UnifiedCategory } from "@/utils/categoryMapper";
import type { Promotion } from "@/types/promotion";

export interface FetchPromotionsParams {
  brandName?: string;
  dealType?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  orderBy?: "start_date" | "end_date" | "created_at" | "saved_count";
  ascending?: boolean;
  limit?: number;
  offset?: number;
}

export interface FetchPromotionsResult {
  data: Promotion[];
  hasMore: boolean;
  error?: string;
}

export async function fetchPromotions(
  params: FetchPromotionsParams
): Promise<FetchPromotionsResult> {
  try {
    const {
      brandName,
      dealType,
      category,
      startDate,
      endDate,
      orderBy = "end_date",
      ascending = true,
      limit = 20,
      offset = 0,
    } = params;

    const supabase = createClient();

    let query = supabase
      .from("promo_with_brand")
      .select(
        "id, brand_name, title, raw_title, deal_type, start_date, end_date, sale_price, normal_price, category, image_url, barcode, source_url, description, saved_count",
        { count: "exact" }
      )
      .order(orderBy, { ascending });

    // 브랜드 필터
    if (brandName && brandName !== "ALL") {
      query = query.eq("brand_name", brandName);
    }

    // 딜 타입 필터
    if (dealType && dealType !== "ALL") {
      query = query.eq("deal_type", dealType);
    }

    // 카테고리 필터
    if (category && category !== "ALL") {
      const originalCategories = getOriginalCategories(
        category as UnifiedCategory
      );
      if (originalCategories.length > 0) {
        query = query.in("category", originalCategories);
      }
    }

    // 날짜 범위 필터
    if (startDate && endDate) {
      query = query.lte("start_date", endDate).gte("end_date", startDate);
    }

    // 페이지네이션
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching promotions:", error);
      return { data: [], hasMore: false, error: error.message };
    }

    const hasMore = count ? offset + limit < count : false;

    return { data: (data as Promotion[]) || [], hasMore };
  } catch (error) {
    console.error("Failed to fetch promotions:", error);
    return {
      data: [],
      hasMore: false,
      error: "Failed to fetch promotions",
    };
  }
}
