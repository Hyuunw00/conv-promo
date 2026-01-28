'use server';

import { createClient } from '@/lib/supabase/server';
import { Promotion, SavedPromotion } from '@/types/promotion';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: 저장된 프로모션 ID 목록 조회
 * @param userEmail 사용자 이메일
 * @returns 프로모션 ID 배열
 */
export async function fetchSavedPromoIdsAction(
  userEmail: string
): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('saved_promotions')
      .select('promo_id')
      .eq('user_email', userEmail);

    if (error) {
      console.error('Error fetching saved promo ids:', error);
      return [];
    }

    return data?.map((item) => item.promo_id) || [];
  } catch (error) {
    console.error('Failed to fetch saved promo ids:', error);
    return [];
  }
}

/**
 * Server Action: 저장된 프로모션 목록 조회 (페이지네이션)
 * @param userEmail 사용자 이메일
 * @param page 페이지 번호 (0부터 시작)
 * @param itemsPerPage 페이지당 아이템 수
 * @returns 프로모션 목록과 hasMore 여부
 */
export async function fetchSavedPromotionsAction(
  userEmail: string,
  page: number = 0,
  itemsPerPage: number = 20
): Promise<{
  data: Promotion[];
  hasMore: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error, count } = await supabase
      .from('saved_promotions')
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
      `,
        { count: 'exact' }
      )
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .range(page * itemsPerPage, (page + 1) * itemsPerPage - 1);

    if (error) {
      console.error('Error fetching saved promotions:', error);
      return { data: [], hasMore: false, error: error.message };
    }

    const promotions = ((data as unknown as SavedPromotion[])
      ?.map((item) => {
        if (!item.promo) return null;
        const promo = item.promo;
        return {
          id: promo.id,
          brand_name: promo.brand?.name || '',
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

    const hasMore = count ? (page + 1) * itemsPerPage < count : false;

    return { data: promotions, hasMore };
  } catch (error) {
    console.error('Failed to fetch saved promotions:', error);
    return {
      data: [],
      hasMore: false,
      error: 'Failed to fetch saved promotions',
    };
  }
}

/**
 * Server Action: 프로모션 저장
 * @param userEmail 사용자 이메일
 * @param promoId 프로모션 ID
 * @returns 성공 여부
 */
export async function savePromotionAction(
  userEmail: string,
  promoId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('saved_promotions').insert({
      user_email: userEmail,
      promo_id: promoId,
    });

    if (error) {
      console.error('Error saving promotion:', error);
      return { success: false, error: error.message };
    }

    // 저장 페이지 캐시 무효화
    revalidatePath('/saved');

    return { success: true };
  } catch (error) {
    console.error('Failed to save promotion:', error);
    return { success: false, error: 'Failed to save promotion' };
  }
}

/**
 * Server Action: 프로모션 저장 해제
 * @param userEmail 사용자 이메일
 * @param promoId 프로모션 ID
 * @returns 성공 여부
 */
export async function unsavePromotionAction(
  userEmail: string,
  promoId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('saved_promotions')
      .delete()
      .eq('user_email', userEmail)
      .eq('promo_id', promoId);

    if (error) {
      console.error('Error unsaving promotion:', error);
      return { success: false, error: error.message };
    }

    // 저장 페이지 캐시 무효화
    revalidatePath('/saved');

    return { success: true };
  } catch (error) {
    console.error('Failed to unsave promotion:', error);
    return { success: false, error: 'Failed to unsave promotion' };
  }
}

/**
 * Server Action: 프로모션 저장 토글 (저장/해제)
 * @param userEmail 사용자 이메일
 * @param promoId 프로모션 ID
 * @returns 성공 여부 및 저장 상태
 */
export async function toggleSavePromotionAction(
  userEmail: string,
  promoId: string
): Promise<{ success: boolean; saved: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 현재 저장 상태 확인
    const { data: existing } = await supabase
      .from('saved_promotions')
      .select('id')
      .eq('user_email', userEmail)
      .eq('promo_id', promoId)
      .single();

    if (existing) {
      // 이미 저장되어 있으면 삭제
      const result = await unsavePromotionAction(userEmail, promoId);
      return { ...result, saved: false };
    } else {
      // 저장되어 있지 않으면 추가
      const result = await savePromotionAction(userEmail, promoId);
      return { ...result, saved: true };
    }
  } catch (error) {
    console.error('Failed to toggle save promotion:', error);
    return {
      success: false,
      saved: false,
      error: 'Failed to toggle save promotion',
    };
  }
}

/**
 * Server Action: 프로모션이 저장되어 있는지 확인
 * @param userEmail 사용자 이메일
 * @param promoId 프로모션 ID
 * @returns 저장 여부
 */
export async function checkPromotionSavedAction(
  userEmail: string,
  promoId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from('saved_promotions')
      .select('id')
      .eq('user_email', userEmail)
      .eq('promo_id', promoId)
      .single();

    return !!data;
  } catch (error) {
    console.error('Failed to check promotion saved:', error);
    return false;
  }
}
