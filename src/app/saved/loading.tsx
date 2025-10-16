export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 스켈레톤 */}
      <div className="bg-white shadow-sm p-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
      </div>

      {/* 저장된 프로모션 카드 스켈레톤 */}
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            {/* 이미지 영역 */}
            <div className="h-48 bg-gray-200" />

            <div className="p-4">
              {/* 브랜드와 하트 */}
              <div className="flex justify-between items-start mb-2">
                <div className="h-6 w-16 bg-gray-200 rounded" />
                <div className="h-5 w-5 bg-gray-200 rounded" />
              </div>

              {/* 제목 */}
              <div className="space-y-2 mb-2">
                <div className="h-6 bg-gray-200 rounded" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </div>

              {/* 딜 타입과 가격 */}
              <div className="flex gap-2 mb-2">
                <div className="h-6 w-16 bg-gray-200 rounded" />
                <div className="h-6 w-20 bg-gray-200 rounded" />
              </div>

              {/* 날짜 */}
              <div className="h-5 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
