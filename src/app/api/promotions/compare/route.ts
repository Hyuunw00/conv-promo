import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 편의점별 프로모션 비교 API
 * GET /api/promotions/compare?query=코카콜라
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 검색어로 모든 프로모션 조회
    const { data, error } = await supabase
      .from('promo_with_brand')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('sale_price', { ascending: true }); // 가격 낮은 순

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch promotions' },
        { status: 500 }
      );
    }

    // 브랜드별로 그룹화 (각 브랜드당 가장 저렴한 1개만)
    const brandMap = new Map();

    for (const promo of data || []) {
      const brandName = promo.brand_name;

      if (!brandMap.has(brandName)) {
        brandMap.set(brandName, promo);
      }
      // 이미 해당 브랜드가 있으면 가격이 더 낮은 것으로 교체
      else {
        const existing = brandMap.get(brandName);
        if (promo.sale_price < existing.sale_price) {
          brandMap.set(brandName, promo);
        }
      }
    }

    // Map을 배열로 변환하고 브랜드명 순 정렬
    const comparison = Array.from(brandMap.values()).sort((a, b) =>
      a.brand_name.localeCompare(b.brand_name)
    );

    // 최저가 찾기
    const lowestPrice = comparison.length > 0
      ? Math.min(...comparison.map(p => p.sale_price))
      : null;

    return NextResponse.json({
      query,
      comparison,
      lowestPrice,
      total: comparison.length,
    });
  } catch (error) {
    console.error('Compare API error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
