import { supabase } from "@/lib/supabase";
import { Promotion } from "@/types/promotion";

export interface FetchPromotionsOptions {
  limit?: number;
  offset?: number;
  brandName?: string;
  dealType?: string;
  startDate?: string;
  endDate?: string;
  orderBy?: "start_date" | "end_date" | "created_at";
  ascending?: boolean;
}

export class PromotionService {
  //

  static async fetchPromotions(
    options: FetchPromotionsOptions = {}
  ): Promise<{ data: Promotion[] | null; error: Error | null; hasMore?: boolean }> {
    try {
      // 기본값 설정
      const {
        limit = 20,
        offset = 0,
        brandName,
        dealType,
        startDate,
        endDate,
        orderBy = "end_date",
        ascending = true,
      } = options;

      let query = supabase
        .from("promo_with_brand")
        .select(
          "id, brand_name, title, deal_type, start_date, end_date, sale_price, category",
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

      // 날짜 범위 필터 (프로모션이 선택한 기간과 겹치는 경우)
      if (startDate && endDate) {
        query = query
          .lte("start_date", endDate)  // 프로모션 시작일이 필터 종료일 이전
          .gte("end_date", startDate);  // 프로모션 종료일이 필터 시작일 이후
      }

      // 페이지네이션 적용
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching promotions:", error);
        return { data: null, error, hasMore: false };
      }

      // 더 많은 데이터가 있는지 확인
      const hasMore = count ? (offset + limit) < count : false;

      return { data: data as Promotion[], error: null, hasMore };
    } catch (error) {
      console.error("Unexpected error:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
        hasMore: false
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
