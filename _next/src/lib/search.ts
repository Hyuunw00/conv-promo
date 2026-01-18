import { createClient } from "@/lib/supabase/client";
import type { Promotion } from "@/types/promotion";

/**
 * 검색 자동완성 제안 가져오기
 */
export async function fetchSearchSuggestions(
  query: string,
  limit: number = 5
): Promise<string[]> {
  if (!query.trim()) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("promo_with_brand")
    .select("title")
    .ilike("title", `%${query}%`)
    .limit(limit);

  return data?.map((item) => item.title) || [];
}

/**
 * 검색 결과 가져오기 (페이지네이션)
 */
export async function fetchSearchResults(
  query: string,
  page: number,
  itemsPerPage: number = 20
): Promise<{ data: Promotion[]; hasMore: boolean }> {
  if (!query.trim()) {
    return { data: [], hasMore: false };
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("promo_with_brand")
    .select("*")
    .ilike("title", `%${query}%`)
    .range(page * itemsPerPage, (page + 1) * itemsPerPage - 1);

  const results = (data as Promotion[]) || [];

  return {
    data: results,
    hasMore: results.length === itemsPerPage,
  };
}

/**
 * 편의점별 프로모션 가격 비교
 */
export async function fetchComparisonData(query: string): Promise<{
  comparison: Promotion[];
  lowestPrice: number | null;
}> {
  if (!query.trim()) {
    return { comparison: [], lowestPrice: null };
  }

  const supabase = createClient();

  // 검색어로 모든 프로모션 조회 (가격 낮은 순)
  const { data, error } = await supabase
    .from("promo_with_brand")
    .select("*")
    .ilike("title", `%${query}%`)
    .order("sale_price", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error("Failed to fetch promotions");
  }

  // 브랜드별로 그룹화 (각 브랜드당 가장 저렴한 1개만)
  const brandMap = new Map<string, Promotion>();

  for (const promo of data || []) {
    const brandName = promo.brand_name;

    if (!brandMap.has(brandName)) {
      brandMap.set(brandName, promo);
    } else {
      // 이미 해당 브랜드가 있으면 가격이 더 낮은 것으로 교체
      const existing = brandMap.get(brandName);
      if (
        existing &&
        promo.sale_price &&
        existing.sale_price &&
        promo.sale_price < existing.sale_price
      ) {
        brandMap.set(brandName, promo);
      }
    }
  }

  // Map을 배열로 변환하고 브랜드명 순 정렬
  const comparison = Array.from(brandMap.values()).sort((a, b) =>
    a.brand_name.localeCompare(b.brand_name)
  );

  // 최저가 찾기
  const lowestPrice =
    comparison.length > 0
      ? Math.min(...comparison.map((p) => p.sale_price || 0))
      : null;

  return {
    comparison,
    lowestPrice,
  };
}
