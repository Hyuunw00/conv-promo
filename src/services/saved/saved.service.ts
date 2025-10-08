import { createClient } from "@/lib/supabase/server";

export interface SavedPromotion {
  id: string;
  title: string;
  brand_name: string;
  deal_type: string;
  normal_price?: number;
  sale_price?: number;
  start_date: string;
  end_date: string;
  image_url?: string;
}

export class SavedPromotionService {
  /**
   * 사용자가 저장한 프로모션 ID 목록만 가져오기
   * @param userEmail 사용자 이메일
   * @returns 저장된 프로모션 ID 배열
   */
  static async getSavedPromoIds(userEmail: string): Promise<{
    data: string[] | null;
    error: Error | null;
  }> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('saved_promotions')
        .select('promo_id')
        .eq('user_email', userEmail);

      if (error) {
        console.error('Error loading saved promo ids:', error);
        return { data: null, error };
      }

      const ids = data?.map(item => item.promo_id) || [];
      return { data: ids, error: null };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }
  /**
   * 사용자의 저장된 프로모션 목록 조회
   * @param userEmail 사용자 이메일
   * @returns 저장된 프로모션 목록
   */
  static async getSavedPromotions(userEmail: string): Promise<{
    data: SavedPromotion[] | null;
    error: Error | null;
  }> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('saved_promotions')
        .select(`
          id,
          created_at,
          promo:promo_with_brand!inner (
            id,
            title,
            brand_name,
            deal_type,
            normal_price,
            sale_price,
            start_date,
            end_date,
            image_url
          )
        `)
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading saved promos:', error);
        return { data: null, error };
      }

      // 데이터 형식 변환
      const formattedData = data?.map(item => item.promo as unknown as SavedPromotion) || [];
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * 프로모션 저장 상태 확인
   * @param userEmail 사용자 이메일
   * @param promoId 프로모션 ID
   * @returns 저장 여부
   */
  static async isSaved(userEmail: string, promoId: string): Promise<{
    data: boolean;
    error: Error | null;
  }> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('saved_promotions')
        .select('id')
        .eq('user_email', userEmail)
        .eq('promo_id', promoId)
        .single();

      if (error && error.code !== 'PGRST116') {  // PGRST116: no rows returned
        console.error('Error checking saved status:', error);
        return { data: false, error };
      }

      return { data: !!data, error: null };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        data: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * 프로모션 저장
   * @param userEmail 사용자 이메일
   * @param promoId 프로모션 ID
   * @returns 저장 결과
   */
  static async savePromotion(userEmail: string, promoId: string): Promise<{
    data: boolean;
    error: Error | null;
  }> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('saved_promotions')
        .insert({
          user_email: userEmail,
          promo_id: promoId,
        });

      if (error) {
        console.error('Error saving promotion:', error);
        return { data: false, error };
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        data: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * 저장된 프로모션 삭제
   * @param userEmail 사용자 이메일
   * @param promoId 프로모션 ID
   * @returns 삭제 결과
   */
  static async removePromotion(userEmail: string, promoId: string): Promise<{
    data: boolean;
    error: Error | null;
  }> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('saved_promotions')
        .delete()
        .eq('user_email', userEmail)
        .eq('promo_id', promoId);

      if (error) {
        console.error('Error removing saved promotion:', error);
        return { data: false, error };
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        data: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * 프로모션 저장 토글
   * @param userEmail 사용자 이메일
   * @param promoId 프로모션 ID
   * @returns 토글 결과 (saved: true면 저장됨, false면 삭제됨)
   */
  static async toggleSave(userEmail: string, promoId: string): Promise<{
    data: { saved: boolean } | null;
    error: Error | null;
  }> {
    try {
      // 현재 저장 상태 확인
      const { data: isCurrentlySaved } = await this.isSaved(userEmail, promoId);

      if (isCurrentlySaved) {
        // 이미 저장되어 있으면 삭제
        const { error } = await this.removePromotion(userEmail, promoId);
        if (error) return { data: null, error };
        return { data: { saved: false }, error: null };
      } else {
        // 저장되어 있지 않으면 저장
        const { error } = await this.savePromotion(userEmail, promoId);
        if (error) return { data: null, error };
        return { data: { saved: true }, error: null };
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }
}