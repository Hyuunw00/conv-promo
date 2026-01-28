'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Server Action: 현재 사용자가 관리자인지 확인
 * @param userEmail 사용자 이메일
 * @returns 관리자 여부
 */
export async function checkIsAdminAction(
  userEmail: string | null | undefined
): Promise<boolean> {
  try {
    if (!userEmail) {
      return false;
    }

    const supabase = await createClient();

    // user_roles 테이블에서 권한 확인
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_email', userEmail)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === 'admin';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

/**
 * Server Action: 관리자 권한 필수 체크 (없으면 에러)
 * @param userEmail 사용자 이메일
 */
export async function requireAdminAction(
  userEmail: string | null | undefined
): Promise<{ success: boolean; error?: string }> {
  try {
    const hasPermission = await checkIsAdminAction(userEmail);

    if (!hasPermission) {
      return { success: false, error: '관리자 권한이 필요합니다' };
    }

    return { success: true };
  } catch (error) {
    console.error('Admin require error:', error);
    return { success: false, error: '권한 확인 중 오류가 발생했습니다' };
  }
}
