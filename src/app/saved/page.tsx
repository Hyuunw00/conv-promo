import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SavedPromoCard } from "@/components/saved/SavedPromoCard";
import { SavedPromotionService } from "@/services/saved/saved.service";
import { Heart } from "lucide-react";
import Link from "next/link";

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/auth/login");
  }

  const { data: savedPromos } = await SavedPromotionService.getSavedPromotions(
    user.email
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">저장한 프로모션</h1>

      {savedPromos && savedPromos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPromos.map((promo) => (
            <SavedPromoCard
              key={promo.id}
              promo={promo}
              userEmail={user.email!}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            저장한 프로모션이 없습니다.
          </p>
          <p className="text-gray-400">
            홈에서 관심있는 프로모션을 저장해보세요!
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            프로모션 보러가기
          </Link>
        </div>
      )}
    </div>
  );
}
