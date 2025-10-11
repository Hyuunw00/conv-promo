import { createClient } from '@/lib/supabase/server';

/**
 * 사용자가 admin 권한을 가지고 있는지 확인
 */
export async function isAdmin(userEmail: string | null | undefined): Promise<boolean> {
  if (!userEmail) return false;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_email', userEmail)
    .single();

  if (error || !data) return false;

  return data.role === 'admin';
}

/**
 * admin 권한 체크 (없으면 에러)
 */
export async function requireAdmin(userEmail: string | null | undefined) {
  const hasPermission = await isAdmin(userEmail);

  if (!hasPermission) {
    throw new Error('관리자 권한이 필요합니다');
  }

  return true;
}
