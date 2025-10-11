'use client';

import { createClient } from '@/lib/supabase/client';

// OAuth 인증 관련 유틸리티 함수들
// 클라이언트 컴포넌트에서만 사용

export const signOut = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// 소셜 로그인
export const signInWithGoogle = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

export const signInWithKakao = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

// 회원 탈퇴
export const deleteAccount = async () => {
  try {
    const response = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: new Error(data.error || '회원 탈퇴에 실패했습니다') };
    }

    return { error: null };
  } catch (error) {
    console.error('Delete account error:', error);
    return { error: new Error('회원 탈퇴 중 오류가 발생했습니다') };
  }
};