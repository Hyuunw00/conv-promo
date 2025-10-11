import { createClient } from "@/lib/supabase/server";
import { Promotion } from "@/types/promotion";
import {
  getOriginalCategories,
  UnifiedCategory,
} from "@/utils/categoryMapper";

export interface FetchPromotionsOptions {
  limit?: number;
  offset?: number;
  brandName?: string;
  dealType?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  orderBy?: "start_date" | "end_date" | "created_at" | "saved_count";
  ascending?: boolean;
}

export class PromotionService {
  //

  /**
   * 프로모션 조회
   * @param options 옵션
   * @returns 프로모션 배열
   */
  static async fetchPromotions(options: FetchPromotionsOptions = {}): Promise<{
    data: Promotion[] | null;
    error: Error | null;
    hasMore?: boolean;
  }> {
    try {
      const supabase = await createClient();
      // 기본값 설정
      const {
        limit = 20,
        offset = 0,
        brandName,
        dealType,
        category,
        startDate,
        endDate,
        orderBy = "end_date",
        ascending = true,
      } = options;

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

      // 카테고리 필터 (통일 카테고리 → 원본 카테고리 목록)
      if (category && category !== "ALL") {
        const originalCategories = getOriginalCategories(
          category as UnifiedCategory
        );
        if (originalCategories.length > 0) {
          query = query.in("category", originalCategories);
        }
      }

      // 날짜 범위 필터 (프로모션이 선택한 기간과 겹치는 경우)
      if (startDate && endDate) {
        query = query
          .lte("start_date", endDate) // 프로모션 시작일이 필터 종료일 이전
          .gte("end_date", startDate); // 프로모션 종료일이 필터 시작일 이후
      }

      // 페이지네이션 적용
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching promotions:", error);
        return { data: null, error, hasMore: false };
      }

      // 더 많은 데이터가 있는지 확인
      const hasMore = count ? offset + limit < count : false;

      return { data: data as Promotion[], error: null, hasMore };
    } catch (error) {
      console.error("Unexpected error:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
        hasMore: false,
      };
    }
  }

  /**
   * 프로모션 상세 조회
   * @param id 프로모션 ID
   * @returns 프로모션 상세
   */
  static async fetchPromotionById(
    id: string
  ): Promise<{ data: Promotion | null; error: Error | null }> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("promo_with_brand")
        .select(
          "id, brand_name, title, raw_title, deal_type, start_date, end_date, sale_price, normal_price, category, image_url, barcode, source_url, description"
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

  /**
   * 검색 프로모션 조회
   * @param query 검색어
   * @param limit 조회 개수
   * @returns 프로모션 배열
   */
  static async fetchSearchPromotions(
    query: string,
    limit: number = 50
  ): Promise<{ data: Promotion[] | null; error: Error | null }> {
    try {
      if (!query.trim()) {
        return { data: [], error: null };
      }

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("promo_with_brand")
        .select(
          "id, brand_name, title, raw_title, deal_type, start_date, end_date, sale_price, normal_price, category, image_url, barcode, source_url, description"
        )
        .or(
          `title.ilike.%${query}%,category.ilike.%${query}%,brand_name.ilike.%${query}%`
        )
        .order("end_date", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error searching promotions:", error);
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

  /**
   * 검색 자동완성 제목 추천
   * @param query 검색어
   * @param limit 추천 개수
   * @returns 추천 제목 배열
   */
  static async fetchSearchSuggestions(
    query: string,
    limit: number = 5
  ): Promise<{ data: string[] | null; error: Error | null }> {
    try {
      if (!query.trim()) {
        return { data: [], error: null };
      }

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("promo_with_brand")
        .select("title")
        .ilike("title", `%${query}%`)
        .limit(limit * 2); // 중복 제거 후 limit 맞추기 위해 더 가져옴

      if (error) {
        console.error("Error fetching suggestions:", error);
        return { data: null, error };
      }

      // 중복 제거 및 정제
      const uniqueTitles = Array.from(
        new Set((data || []).map((item) => item.title))
      ).slice(0, limit);

      return { data: uniqueTitles, error: null };
    } catch (error) {
      console.error("Unexpected error:", error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }

  /**
   * 인기 프로모션 조회
   * @param limit 조회 개수
   * @param daysAgo 일 수
   * @returns 프로모션 배열
   */
  static async fetchPopularPromotions(
    limit: number = 30,
    daysAgo: number = 0
  ): Promise<{ data: Promotion[] | null; error: Error | null }> {
    try {
      const supabase = await createClient();
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - daysAgo);

      // 현재 진행중인 프로모션 중에서
      let query = supabase
        .from("promo_with_brand")
        .select(
          "id, brand_name, title, raw_title, deal_type, start_date, end_date, sale_price, normal_price, category, image_url, barcode, source_url, description"
        )
        .gte("end_date", today.toISOString().split("T")[0]) // 종료일이 오늘 이후
        .lte("start_date", today.toISOString().split("T")[0]); // 시작일이 오늘 이전

      // 기간 필터가 있으면 적용
      if (daysAgo > 0) {
        query = query.gte("start_date", startDate.toISOString().split("T")[0]);
      }

      // 2+1, 1+1 우선 필터링
      query = query
        .in("deal_type", ["TWO_PLUS_ONE", "ONE_PLUS_ONE"])
        .order("start_date", { ascending: false }) // 최근 시작한 것부터
        .limit(limit);

      const { data, error } = await query;

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
