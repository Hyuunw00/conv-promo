"use client";

import { useState, useCallback } from "react";
import PromoCardEnhanced from "@/components/PromoCardEnhanced";
import { toggleSavePromo } from "@/app/actions/saved-actions";
import { Heart } from "lucide-react";
import Link from "next/link";

interface SavedPageClientProps {
  savedPromos: any[];
  userEmail: string;
}

export default function SavedPageClient({
  savedPromos: initialPromos,
  userEmail,
}: SavedPageClientProps) {
  const [savedPromoIds, setSavedPromoIds] = useState<Set<string>>(
    new Set(initialPromos.map((p) => p.id))
  );

  // 저장 토글 핸들러
  const handleSaveToggle = useCallback(
    async (promoId: string) => {
      if (!userEmail) {
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        const result = await toggleSavePromo(userEmail, promoId);
        if (result.success) {
          setSavedPromoIds((prev) => {
            const newSet = new Set(prev);
            if (result.saved) {
              newSet.add(promoId);
            } else {
              newSet.delete(promoId);
            }
            return newSet;
          });
        }
      } catch (error) {
        console.error("Error toggling save:", error);
      }
    },
    [userEmail]
  );

  // 저장된 프로모션만 필터링
  const displayedPromos = initialPromos.filter((promo) =>
    savedPromoIds.has(promo.id)
  );

  return (
    <main className="px-3 pb-16 pt-3">
      {displayedPromos.length > 0 ? (
        <div className="space-y-3">
          {displayedPromos.map((promo) => (
            <PromoCardEnhanced
              key={promo.id}
              promotion={promo}
              isSaved={savedPromoIds.has(promo.id)}
              onSaveToggle={handleSaveToggle}
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
  );
}
