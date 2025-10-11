import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'endpoint가 필요합니다' },
        { status: 400 }
      );
    }

    // DB에서 삭제
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Delete subscription error:', error);
      return NextResponse.json(
        { error: '구독 삭제에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
