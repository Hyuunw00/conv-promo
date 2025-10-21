import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MyPageClient from "./client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "프로필 정보 및 설정을 관리하세요",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/mypage",
  },
};

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // admin 권한 체크 (서버에서)
  const { data: adminData } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .single();

  const isAdmin = !!adminData;

  return <MyPageClient user={user} isAdmin={isAdmin} />;
}
