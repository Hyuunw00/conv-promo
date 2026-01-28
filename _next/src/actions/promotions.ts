'use server';

import { createClient } from '@/lib/supabase/server';
import { getOriginalCategories, UnifiedCategory } from '@/utils/categoryMapper';
import type { Promotion } from '@/types/promotion';

/**
 * 프로모션 조회 파라미터
 */
export interface FetchPromotionsParams {
  brandName?: string;
  dealType?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  orderBy?: 'start_date' | 'end_date' | 'created_at' | 'saved_count';
  ascending?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * 프로모션 조회 결과
 */
export interface FetchPromotionsResult {
  data: Promotion[];
  hasMore: boolean;
  error?: string;
}

/**
 * Server Action: 프로모션 목록 조회
 * - 필터링: 브랜드, 딜 타입, 카테고리, 날짜 범위
 * - 정렬: 시작일, 종료일, 생성일, 저장 수
 * - 페이지네이션: offset, limit
 */
export async function fetchPromotionsAction(
  params: FetchPromotionsParams = {}
): Promise<FetchPromotionsResult> {
  try {
    const {
      brandName,
      dealType,
      category,
      startDate,
      endDate,
      orderBy = 'end_date',
      ascending = true,
      limit = 20,
      offset = 0,
    } = params;

    const supabase = await createClient();

    let query = supabase
      .from('promo_with_brand')
      .select(
        'id, brand_name, title, raw_title, deal_type, start_date, end_date, sale_price, normal_price, category, image_url, barcode, source_url, description, saved_count',
        { count: 'exact' }
      )
      .order(orderBy, { ascending });

    // 브랜드 필터
    if (brandName && brandName !== 'ALL') {
      query = query.eq('brand_name', brandName);
    }

    // 딜 타입 필터
    if (dealType && dealType !== 'ALL') {
      query = query.eq('deal_type', dealType);
    }

    // 카테고리 필터 (통일 카테고리 → 원본 카테고리 매핑)
    if (category && category !== 'ALL') {
      const originalCategories = getOriginalCategories(
        category as UnifiedCategory
      );
      if (originalCategories.length > 0) {
        query = query.in('category', originalCategories);
      }
    }

    // 날짜 범위 필터 (프로모션이 선택한 기간과 겹치는 경우)
    if (startDate && endDate) {
      query = query
        .lte('start_date', endDate) // 프로모션 시작일이 필터 종료일 이전
        .gte('end_date', startDate); // 프로모션 종료일이 필터 시작일 이후
    }

    // 페이지네이션
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching promotions:', error);
      return { data: [], hasMore: false, error: error.message };
    }

    const hasMore = count ? offset + limit < count : false;

    return { data: (data as Promotion[]) || [], hasMore };
  } catch (error) {
    console.error('Failed to fetch promotions:', error);
    return {
      data: [],
      hasMore: false,
      error: 'Failed to fetch promotions',
    };
  }
}

/**
 * Server Action: 프로모션 검색
 * - 제목, 카테고리, 브랜드명으로 검색
 */
export async function searchPromotionsAction(
  query: string,
  limit: number = 50
): Promise<{ data: Promotion[] | null; error: string | null }> {
  try {
    if (!query.trim()) {
      return { data: [], error: null };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('promo_with_brand')
      .select(
        'id, brand_name, title, raw_title, deal_type, start_date, end_date, sale_price, normal_price, category, image_url, barcode, source_url, description, saved_count'
      )
      .or(
        `title.ilike.%${query}%,category.ilike.%${query}%,brand_name.ilike.%${query}%`
      )
      .order('end_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching promotions:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Promotion[], error: null };
  } catch (error) {
    console.error('Failed to search promotions:', error);
    return {
      data: null,
      error: 'Failed to search promotions',
    };
  }
}

/**
 * Server Action: 검색 자동완성 제안
 * - 제목 기반 자동완성 (중복 제거)
 */
export async function fetchSearchSuggestionsAction(
  query: string,
  limit: number = 5
): Promise<{ data: string[] | null; error: string | null }> {
  try {
    if (!query.trim()) {
      return { data: [], error: null };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('promo_with_brand')
      .select('title')
      .ilike('title', `%${query}%`)
      .limit(limit * 2); // 중복 제거 후 limit 맞추기 위해 더 가져옴

    if (error) {
      console.error('Error fetching suggestions:', error);
      return { data: null, error: error.message };
    }

    // 중복 제거 및 정제
    const uniqueTitles = Array.from(
      new Set((data || []).map((item) => item.title))
    ).slice(0, limit);

    return { data: uniqueTitles, error: null };
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    return {
      data: null,
      error: 'Failed to fetch suggestions',
    };
  }
}

/**
 * Server Action: 인기 프로모션 조회
 * - 현재 진행 중인 프로모션 중 2+1, 1+1 우선
 */
export async function fetchPopularPromotionsAction(
  limit: number = 30,
  daysAgo: number = 0
): Promise<{ data: Promotion[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - daysAgo);

    let query = supabase
      .from('promo_with_brand')
      .select(
        'id, brand_name, title, raw_title, deal_type, start_date, end_date, sale_price, normal_price, category, image_url, barcode, source_url, description, saved_count'
      )
      .gte('end_date', today.toISOString().split('T')[0])
      .lte('start_date', today.toISOString().split('T')[0]);

    if (daysAgo > 0) {
      query = query.gte('start_date', startDate.toISOString().split('T')[0]);
    }

    query = query
      .in('deal_type', ['TWO_PLUS_ONE', 'ONE_PLUS_ONE'])
      .order('start_date', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching popular promotions:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Promotion[], error: null };
  } catch (error) {
    console.error('Failed to fetch popular promotions:', error);
    return {
      data: null,
      error: 'Failed to fetch popular promotions',
    };
  }
}

/**
 * Server Action: 프로모션 상세 조회
 */
export async function fetchPromotionByIdAction(
  id: string
): Promise<{ data: Promotion | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('promo_with_brand')
      .select(
        'id, brand_name, title, raw_title, deal_type, start_date, end_date, sale_price, normal_price, category, image_url, barcode, source_url, description, saved_count'
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching promotion by id:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Promotion, error: null };
  } catch (error) {
    console.error('Failed to fetch promotion by id:', error);
    return {
      data: null,
      error: 'Failed to fetch promotion',
    };
  }
}

/**
 * Server Action: 편의점별 프로모션 가격 비교
 * - 동일 상품을 브랜드별로 비교
 * - 각 브랜드당 가장 저렴한 1개만 반환
 */
export async function fetchComparisonDataAction(query: string): Promise<{
  comparison: Promotion[];
  lowestPrice: number | null;
  error?: string;
}> {
  try {
    if (!query.trim()) {
      return { comparison: [], lowestPrice: null };
    }

    const supabase = await createClient();

    // 검색어로 모든 프로모션 조회 (가격 낮은 순)
    const { data, error } = await supabase
      .from('promo_with_brand')
      .select(
        'id, brand_name, title, raw_title, deal_type, start_date, end_date, sale_price, normal_price, category, image_url, barcode, source_url, description, saved_count'
      )
      .ilike('title', `%${query}%`)
      .order('sale_price', { ascending: true });

    if (error) {
      console.error('Error fetching comparison data:', error);
      return { comparison: [], lowestPrice: null, error: error.message };
    }

    // 브랜드별로 그룹화 (각 브랜드당 가장 저렴한 1개만)
    const brandMap = new Map<string, Promotion>();

    for (const promo of (data as Promotion[]) || []) {
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
  } catch (error) {
    console.error('Failed to fetch comparison data:', error);
    return {
      comparison: [],
      lowestPrice: null,
      error: 'Failed to fetch comparison data',
    };
  }
}
