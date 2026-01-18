export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 스켈레톤 */}
      <div className="bg-white shadow-sm p-4 mb-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="flex gap-2">
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* 프로모션 카드 스켈레톤 */}
      <div className="px-3 pb-16 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
          >
            {/* 이미지 영역 */}
            <div className="h-56 bg-gray-200" />

            <div className="p-4">
              {/* 브랜드와 딜 타입 */}
              <div className="flex items-center justify-between mb-3">
                <div className="h-6 w-16 bg-gray-200 rounded" />
                <div className="h-6 w-20 bg-gray-200 rounded" />
              </div>

              {/* 제목 */}
              <div className="space-y-2 mb-3">
                <div className="h-5 bg-gray-200 rounded" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
              </div>

              {/* 가격 */}
              <div className="h-7 w-24 bg-gray-200 rounded mb-3" />

              {/* 카테고리와 기간 */}
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-200 rounded" />
                <div className="h-6 w-32 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
