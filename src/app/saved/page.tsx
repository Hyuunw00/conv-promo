import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SavedPromotionService } from "@/services/saved/saved.service";
import SavedPageClient from "./client";
import ScrollToTop from "@/components/ScrollToTop";

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
    await SavedPromotionService.fetchSavedPromotions(user.email);
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
