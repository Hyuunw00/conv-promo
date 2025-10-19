import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">마이페이지</h1>
          </div>
        </div>
      </header>

      {/* 프로필 섹션 스켈레톤 */}
      <div className="bg-white mt-2 animate-pulse">
        <div className="px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-40" />
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 섹션 스켈레톤 */}
      <div className="bg-white mt-2 animate-pulse">
        <div className="divide-y divide-gray-200">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
            <div className="w-5 h-5 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* 서비스 정보 섹션 스켈레톤 */}
      <div className="bg-white mt-2 animate-pulse">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-12" />
            <div className="w-4 h-4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* 로그아웃 버튼 스켈레톤 */}
      <div className="px-4 mt-6 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
