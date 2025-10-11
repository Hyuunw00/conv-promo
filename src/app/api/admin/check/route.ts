import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ isAdmin: false });
    }

    // user_roles 테이블에서 권한 확인
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_email", user.email)
      .single();

    if (error || !data) {
      return NextResponse.json({ isAdmin: false });
    }

    return NextResponse.json({ isAdmin: data.role === "admin" });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
