import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client
 * - Server Components, Server Actions, API Routes에서 사용
 * - 쿠키를 통해 사용자 인증 상태 유지
 * - RLS(Row Level Security) 적용됨
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // Server Component에서 쿠키 설정 시도 시 에러 발생
              // Middleware에서 이미 처리되므로 무시 가능
              console.warn('Failed to set cookie:', name, error);
            }
          });
        },
      },
    }
  );
}

/**
 * Admin Supabase client (Server-side only)
 * - SERVICE_ROLE_KEY 사용으로 RLS 우회
 * - 모든 데이터 접근 가능 (주의 필요)
 * - 크롤러, 관리자 작업 등에만 사용
 *
 * ⚠️ WARNING: 절대 클라이언트에 노출 금지
 */
export async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {}, // Admin client는 쿠키 불필요
      },
    }
  );
}
