"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * 현재 사용자가 관리자인지 확인
 * @returns 관리자 여부
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = createClient();

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return false;
    }

    // user_roles 테이블에서 권한 확인
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_email", user.email)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === "admin";
  } catch (error) {
    console.error("Admin check error:", error);
    return false;
  }
}
