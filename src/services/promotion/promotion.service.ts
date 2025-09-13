import { supabase } from "@/lib/supabase";
import { Promotion } from "@/types/promotion";

export interface FetchPromotionsOptions {
  limit?: number;
  brandName?: string;
  dealType?: string;
  orderBy?: "start_date" | "end_date" | "created_at";
  ascending?: boolean;
}

export class PromotionService {
  //

  static async fetchPromotions(
    options: FetchPromotionsOptions = {}
  ): Promise<{ data: Promotion[] | null; error: Error | null }> {
    try {
      // 기본값으로 종료일 기준 최신순으로 정렬
      const {
        limit = 50,
        brandName,
        dealType,
        orderBy = "end_date",
        ascending = true,
      } = options;

      let query = supabase
        .from("promo_with_brand")
        .select(
          "id, brand_name, title, deal_type, start_date, end_date, sale_price, category"
        )
        .order(orderBy, { ascending })
        .limit(limit);

      // 조건이 있으면 추가
      if (brandName && brandName !== "전체") {
        query = query.eq("brand_name", brandName);
      }

      if (dealType && dealType !== "전체") {
        query = query.eq("deal_type", dealType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching promotions:", error);
        return { data: null, error };
      }

      return { data: data as Promotion[], error: null };
    } catch (error) {
      console.error("Unexpected error:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }

  static async fetchPromotionById(
    id: string
  ): Promise<{ data: Promotion | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("promo_with_brand")
        .select(
          "id, brand_name, title, deal_type, start_date, end_date, sale_price, category, image_url, source_url"
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching promotion by id:", error);
        return { data: null, error };
      }

      return { data: data as Promotion, error: null };
    } catch (error) {
      console.error("Unexpected error:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }

  static async fetchPromotionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<{ data: Promotion[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("promo_with_brand")
        .select(
          "id, brand_name, title, deal_type, start_date, end_date, sale_price, category"
        )
        .gte("end_date", startDate)
        .lte("start_date", endDate)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching promotions by date range:", error);
        return { data: null, error };
      }

      return { data: data as Promotion[], error: null };
    } catch (error) {
      console.error("Unexpected error:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }

  static async fetchPopularPromotions(
    limit: number = 10
  ): Promise<{ data: Promotion[] | null; error: Error | null }> {
    try {
      // 인기 프로모션 로직 (예: 조회수, 좋아요 등 기준)
      // 현재는 최신 할인율이 높은 순으로 정렬
      const { data, error } = await supabase
        .from("promo_with_brand")
        .select(
          "id, brand_name, title, deal_type, start_date, end_date, sale_price, category"
        )
        .order("sale_price", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("Error fetching popular promotions:", error);
        return { data: null, error };
      }

      return { data: data as Promotion[], error: null };
    } catch (error) {
      console.error("Unexpected error:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }
}
