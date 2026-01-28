'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { User } from '@supabase/supabase-js';

/**
 * Server Action: 로그아웃
 */
export async function signOutAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }

    // 모든 페이지 캐시 무효화
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Failed to sign out:', error);
    return { success: false, error: 'Failed to sign out' };
  }
}

/**
 * Server Action: 현재 사용자 정보 조회
 */
export async function getCurrentUserAction(): Promise<{
  user: User | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Get user error:', error);
      return { user: null, error: error.message };
    }

    return { user };
  } catch (error) {
    console.error('Failed to get user:', error);
    return { user: null, error: 'Failed to get user' };
  }
}

/**
 * Server Action: 회원 탈퇴
 * - 저장된 프로모션 삭제
 * - Push 구독 삭제
 * - 사용자 계정 삭제 (Admin API 사용)
 */
export async function deleteAccountAction(
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. 저장된 프로모션 삭제 (CASCADE로 자동 삭제되지만 명시적으로 처리)
    const { error: deletePromoError } = await supabase
      .from('saved_promotions')
      .delete()
      .eq('user_email', userEmail);

    if (deletePromoError) {
      console.error('Error deleting saved promotions:', deletePromoError);
    }

    // 2. Push 구독 삭제
    const { error: deletePushError } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_email', userEmail);

    if (deletePushError) {
      console.error('Error deleting push subscriptions:', deletePushError);
    }

    // 3. 사용자 계정 삭제는 Admin API를 통해 API Route에서 처리
    // (Server Actions에서 직접 Admin API 호출 가능하지만 보안상 API Route 권장)

    // 모든 페이지 캐시 무효화
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete account:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}
