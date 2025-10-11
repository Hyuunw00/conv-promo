import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인 (선택)
    const { data: { user } } = await supabase.auth.getUser();

    // 구독 정보 파싱
    const subscription = await request.json();

    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: '유효하지 않은 구독 정보입니다' },
        { status: 400 }
      );
    }

    // 기존 구독 삭제 (같은 user_email의 이전 구독 제거)
    if (user?.email) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_email', user.email);
    }

    // DB에 저장
    const { error } = await supabase
      .from('push_subscriptions')
      .insert({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_email: user?.email || null,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Save subscription error:', error);
      return NextResponse.json(
        { error: '구독 저장에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
