import { createClient } from "@/lib/supabase/client";
import { Promotion, SavedPromotion } from "@/types/promotion";

/**
 * 저장된 프로모션 목록 가져오기 (페이지네이션)
 * @param userEmail 사용자 이메일
 * @param page 페이지 번호 (0부터 시작)
 * @param itemsPerPage 페이지당 아이템 수
 * @returns 프로모션 목록과 hasMore 여부
 */
export async function fetchSavedPromotions(
  userEmail: string,
  page: number,
  itemsPerPage: number = 20
): Promise<{
  data: Promotion[];
  hasMore: boolean;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("saved_promotions")
    .select(
      `
      promo_id,
      promo:promo_id (
        id,
        title,
        raw_title,
        deal_type,
        normal_price,
        sale_price,
        start_date,
        end_date,
        image_url,
        barcode,
        source_url,
        description,
        category,
        brand:brand_id (
          name
        )
      )
    `
    )
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false })
    .range(page * itemsPerPage, (page + 1) * itemsPerPage - 1);

  if (error) throw error;

  const promotions = ((data as unknown as SavedPromotion[])
    ?.map((item) => {
      if (!item.promo) return null;
      const promo = item.promo;
      return {
        id: promo.id,
        brand_name: promo.brand?.name || "",
        title: promo.title,
        deal_type: promo.deal_type,
        start_date: promo.start_date,
        end_date: promo.end_date,
        sale_price: promo.sale_price,
        normal_price: promo.normal_price,
        image_url: promo.image_url,
        barcode: promo.barcode || undefined,
        source_url: promo.source_url,
        raw_title: promo.raw_title,
        category: promo.category || undefined,
      } as Promotion;
    })
    .filter((item): item is Promotion => item !== null) || []) as Promotion[];

  return {
    data: promotions,
    hasMore: promotions.length === itemsPerPage,
  };
}
