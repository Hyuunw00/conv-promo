import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SavedPromoCard } from "@/components/saved/SavedPromoCard";
import { SavedPromotionService } from "@/services/saved/saved.service";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/auth/login");
  }

  const { data: savedPromos } = await SavedPromotionService.getSavedPromotions(
    user.email
  );

  return (
    <>
      {/* 헤더 섹션 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
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
                  {savedPromos && savedPromos.length > 0
                    ? `${savedPromos.length}개의 프로모션을 저장했어요`
                    : "나중에 보고 싶은 프로모션을 저장하세요"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 콘텐츠 섹션 */}
      <main className="px-3 pb-16 pt-3">
        {savedPromos && savedPromos.length > 0 ? (
          <div className="space-y-3">
            {savedPromos.map((promo) => (
              <SavedPromoCard
                key={promo.id}
                promo={promo}
                userEmail={user.email!}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-1">저장한 프로모션이 없습니다</p>
            <p className="text-gray-400 text-sm">
              홈에서 관심있는 프로모션을 저장해보세요
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              프로모션 보러가기
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
