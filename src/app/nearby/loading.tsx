import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

export default function Loading() {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 pt-safe">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">
                📍 내 주변 편의점
              </h1>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-1" />
            </div>
          </div>

          {/* 검색창 스켈레톤 */}
          <div className="mt-3">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          {/* 필터 스켈레톤 */}
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 w-16 bg-gray-200 rounded-full animate-pulse"
                />
              ))}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-8 bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="pb-16">
        {/* 지도 스켈레톤 */}
        <div className="w-full h-64 bg-gray-200 animate-pulse" />

        {/* 편의점 리스트 스켈레톤 */}
        <div className="px-3 py-3 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-12 bg-gray-200 rounded" />
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
