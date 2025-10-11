import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PromoCardEnhanced from "@/components/PromoCardEnhanced";
import { SavedPromotionService } from "@/services/saved/saved.service";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SavedPageClient from "./SavedPageClient";
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
    await SavedPromotionService.getSavedPromotions(user.email);
  const initialPromos = allSavedPromos?.slice(0, 10) || [];

  return (
    <>
      {/* 헤더 섹션 */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  <Heart className="inline-block w-5 h-5 mr-1 text-red-500 fill-red-500" />
                  저장한 프로모션
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {allSavedPromos && allSavedPromos.length > 0
                    ? `${allSavedPromos.length}개의 프로모션을 저장했어요`
                    : "나중에 보고 싶은 프로모션을 저장하세요"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 콘텐츠 섹션 */}
      <SavedPageClient
        initialPromos={initialPromos}
        totalCount={allSavedPromos?.length || 0}
        userEmail={user.email!}
      />
      <ScrollToTop />
    </>
  );
}
