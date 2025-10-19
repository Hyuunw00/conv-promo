"use client";

import { useRouter } from "next/navigation";
import SearchContent from "@/components/search/search-content";
import ScrollToTop from "@/components/scroll-to-top";

export default function SearchModal() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={() => router.back()}
      />

      {/* 모달 콘텐츠 */}
      <div className="relative w-full max-w-md mt-1 mx-4 min-h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-down flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <SearchContent onClose={() => router.back()} />
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
}
