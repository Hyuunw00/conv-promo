export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 스켈레톤 */}
      <div className="sticky top-0 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-16 h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* 검색 결과 스켈레톤 */}
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="h-56 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}