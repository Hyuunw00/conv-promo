export default function PromoCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      {/* 이미지 섹션 스켈레톤 */}
      <div className="h-56 bg-gray-200" />

      <div className="p-4">
        {/* 상단: 브랜드와 뱃지 */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-12 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-5 w-12 bg-gray-200 rounded-full" />
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* 제목 */}
        <div className="space-y-2 mb-3 min-h-[3rem]">
          <div className="h-5 bg-gray-200 rounded w-full" />
          <div className="h-5 bg-gray-200 rounded w-2/3" />
        </div>

        {/* 가격 정보 */}
        <div className="flex items-baseline gap-3 mb-3">
          <div className="h-7 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>

        {/* 기본 정보 (태그) */}
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-32 bg-gray-200 rounded" />
        </div>

        {/* 상세정보 버튼 */}
        <div className="h-8 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );
}
