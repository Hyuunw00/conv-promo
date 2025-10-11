import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function DELETE() {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError || !user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 401 }
      );
    }

    // 저장된 프로모션 삭제 (cascade 삭제가 설정되어 있지 않은 경우)
    if (user.email) {
      await supabase
        .from('saved_promotions')
        .delete()
        .eq('user_email', user.email);
    }

    // Supabase Admin API를 사용하여 사용자 삭제
    const adminSupabase = await createAdminClient();
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: '회원 탈퇴에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: '회원 탈퇴 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
