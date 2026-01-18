"use client";

import { Promotion } from "@/types/promotion";
import { BRAND_LABELS, BRAND_COLORS, BrandType } from "@/types/store";
import DealBadge from "../deal-badge";
import { formatPrice } from "@/utils/format";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

interface ComparisonViewProps {
  query: string;
  comparison: Promotion[];
  lowestPrice: number | null;
  onClose: () => void;
}

export default function ComparisonView({
  query,
  comparison,
  lowestPrice,
  onClose,
}: ComparisonViewProps) {
  const { user } = useAuth();
  const [savedPromoIds, setSavedPromoIds] = useState<Set<string>>(new Set());

  // 저장된 프로모션 조회
  useEffect(() => {
    if (!user?.email) return;

    const fetchSavedPromos = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("saved_promotions")
        .select("promo_id")
        .eq("user_email", user.email);

      if (data) {
        setSavedPromoIds(new Set(data.map((item) => item.promo_id)));
      }
    };

    fetchSavedPromos();
  }, [user]);

  // 저장/저장 취소
  const handleSaveToggle = async (promoId: string) => {
    if (!user?.email) {
      toast.error("로그인이 필요합니다");
      return;
    }

    const supabase = createClient();
    const isSaved = savedPromoIds.has(promoId);

    if (isSaved) {
      // 저장 취소
      const { error } = await supabase
        .from("saved_promotions")
        .delete()
        .eq("user_email", user.email)
        .eq("promo_id", promoId);

      if (!error) {
        setSavedPromoIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(promoId);
          return newSet;
        });
        toast.success("저장 취소되었습니다");
      }
    } else {
      // 저장
      const { error } = await supabase
        .from("saved_promotions")
        .insert({ user_email: user.email, promo_id: promoId });

      if (!error) {
        setSavedPromoIds((prev) => new Set(prev).add(promoId));
        toast.success("저장되었습니다");
      }
    }
  };
  if (comparison.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-gray-500 mb-2">비교 가능한 상품이 없습니다</p>
        <button
          onClick={onClose}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          검색 결과로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">편의점별 비교</h2>
          <p className="text-sm text-gray-500 mt-1">
            &quot;{query}&quot; 검색 결과
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 비교 테이블 */}
      <div className="space-y-2">
        {comparison.map((promo) => {
          const isLowest = promo.sale_price === lowestPrice;
          const isSaved = savedPromoIds.has(promo.id);

          return (
            <div
              key={promo.id}
              className={`relative border rounded-lg p-3 transition-all ${
                isLowest
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* 저장 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveToggle(promo.id);
                }}
                className="absolute top-2 right-2 p-1.5 hover:bg-white/80 rounded-full transition-colors z-10"
              >
                <svg
                  className={`w-5 h-5 ${
                    isSaved
                      ? "fill-red-500 text-red-500"
                      : "fill-none text-gray-400"
                  }`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                {/* 이미지 */}
                {promo.image_url && (
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={promo.image_url}
                      alt={promo.title}
                      fill
                      className="object-contain rounded"
                      sizes="64px"
                    />
                  </div>
                )}

                {/* 브랜드 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          BRAND_COLORS[promo.brand_name as BrandType],
                      }}
                    />
                    <span className="text-xs font-semibold text-gray-700">
                      {BRAND_LABELS[promo.brand_name as BrandType]}
                    </span>
                    {isLowest && (
                      <span className="inline-flex items-center gap-0.5 p-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-medium rounded">
                        ★ 최저가
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mb-1.5 line-clamp-1">
                    {promo.title}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <DealBadge dealType={promo.deal_type} size="sm" />
                    <span className="text-base font-bold text-gray-900">
                      {formatPrice(promo.sale_price || 0)}원
                    </span>
                    {promo.normal_price != null &&
                      promo.normal_price > (promo.sale_price || 0) && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(promo.normal_price)}원
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 안내 메시지 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          💡 하트 버튼을 눌러 관심 프로모션을 저장하세요
        </p>
      </div>
    </div>
  );
}
