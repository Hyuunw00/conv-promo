import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchSavedPromotionsAction } from "@/actions/saved";
import SavedPageClient from "./client";
import ScrollToTop from "@/components/scroll-to-top";

export const metadata = {
  title: "저장한 프로모션",
  description:
    "내가 저장한 편의점 프로모션 목록을 확인하세요. 관심있는 행사를 모아서 한눈에 볼 수 있습니다.",
  alternates: {
    canonical: "/saved",
  },
};

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/auth/login");
  }

  // 초기 데이터만 가져오기 (10개)
  const { data: allSavedPromos } =
    await fetchSavedPromotionsAction(user.email, 0);
  const initialData = allSavedPromos?.slice(0, 10) || [];

  return (
    <>
      <SavedPageClient
        initialData={initialData}
        totalCount={allSavedPromos?.length || 0}
        userEmail={user.email!}
      />
      <ScrollToTop />
    </>
  );
}
