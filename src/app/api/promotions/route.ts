import { NextRequest, NextResponse } from 'next/server';
import { PromotionService } from '@/services/promotion/promotion.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const brandName = searchParams.get('brandName') || undefined;
    const dealType = searchParams.get('dealType') || undefined;
    const category = searchParams.get('category') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = Number(searchParams.get('limit')) || 20;
    const offset = Number(searchParams.get('offset')) || 0;

    const { data, error, hasMore } = await PromotionService.fetchPromotions({
      brandName,
      dealType,
      category,
      startDate,
      endDate,
      limit,
      offset,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, hasMore });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}