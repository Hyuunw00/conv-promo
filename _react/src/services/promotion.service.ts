import { supabase } from "@/lib/supabase";
import type { Promotion } from "@/types/promotion";
import { getOriginalCategories } from "@/utils/categoryMapper";
import type { UnifiedCategory } from "@/types/category";

export type OrderBy = "created_at" | "saved_count" | "start_date" | "end_date";

export interface FetchPromotionsParams {
  limit?: number;
  offset?: number;
  brandName?: string;
  dealType?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  orderBy?: OrderBy;
  ascending?: boolean;
}

export class PromotionService {
  static async fetchPromotions(params: FetchPromotionsParams = {}): Promise<{
    data: Promotion[] | null;
    error: Error | null;
    hasMore?: boolean;
  }> {
    try {
      const {
        limit = 20,
        offset = 0,
        brandName,
        dealType,
        category,
        startDate,
        endDate,
        search,
        orderBy = "created_at",
        ascending = false,
      } = params;

      let query = supabase
        .from("promo_with_brand")
        .select(
          "id, brand_name, title, raw_title, deal_type, start_date, end_date, sale_price, normal_price, category, image_url, barcode, source_url, description, saved_count",
          { count: "exact" },
        )
        .order(orderBy, { ascending });

      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(
          `title.ilike.%${q}%,category.ilike.%${q}%,brand_name.ilike.%${q}%`,
        );
      }

      if (brandName && brandName !== "ALL") {
        query = query.eq("brand_name", brandName);
      }

      if (dealType && dealType !== "ALL") {
        query = query.eq("deal_type", dealType);
      }

      if (category && category !== "ALL") {
        const originalCategories = getOriginalCategories(
          category as UnifiedCategory,
        );
        if (originalCategories.length > 0) {
          query = query.in("category", originalCategories);
        }
      }

      if (startDate && endDate) {
        query = query.lte("start_date", endDate).gte("end_date", startDate);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error, hasMore: false };
      }

      const hasMore = count ? offset + limit < count : false;

      return { data: data as Promotion[], error: null, hasMore };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
        hasMore: false,
      };
    }
  }

  static async fetchPromotionById(
    id: string,
  ): Promise<{ data: Promotion | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("promo_with_brand")
        .select(
          "id, brand_name, title, raw_title, deal_type, start_date, end_date, sale_price, normal_price, category, image_url, barcode, source_url, description",
        )
        .eq("id", id)
        .single();

      if (error) return { data: null, error };
      return { data: data as Promotion, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }

  static async fetchSearchSuggestions(
    query: string,
    limit: number = 5,
  ): Promise<{ data: string[] | null; error: Error | null }> {
    try {
      if (!query.trim()) return { data: [], error: null };

      const { data, error } = await supabase
        .from("promo_with_brand")
        .select("title")
        .ilike("title", `%${query}%`)
        .limit(limit * 2);

      if (error) return { data: null, error };

      const uniqueTitles = Array.from(
        new Set((data || []).map((item) => item.title)),
      ).slice(0, limit);

      return { data: uniqueTitles, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }

  static async fetchPopularPromotions(
    limit: number = 30,
    daysAgo: number = 0,
  ): Promise<{ data: Promotion[] | null; error: Error | null }> {
    try {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - daysAgo);

      let query = supabase
        .from("promo_with_brand")
        .select(
          "id, brand_name, title, raw_title, deal_type, start_date, end_date, sale_price, normal_price, category, image_url, barcode, source_url, description",
        )
        .gte("end_date", today.toISOString().split("T")[0])
        .lte("start_date", today.toISOString().split("T")[0]);

      if (daysAgo > 0) {
        query = query.gte("start_date", startDate.toISOString().split("T")[0]);
      }

      query = query
        .in("deal_type", ["TWO_PLUS_ONE", "ONE_PLUS_ONE"])
        .order("start_date", { ascending: false })
        .limit(limit);

      const { data, error } = await query;
      if (error) return { data: null, error };

      return { data: data as Promotion[], error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  }
}
