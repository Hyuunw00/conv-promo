export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 animate-pulse">
        <div className="text-center">
          {/* 로고 스켈레톤 */}
          <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-2xl" />

          {/* 제목 스켈레톤 */}
          <div className="h-9 bg-gray-200 rounded w-48 mx-auto mb-2" />
          <div className="h-5 bg-gray-200 rounded w-64 mx-auto" />
        </div>

        {/* 버튼 스켈레톤 */}
        <div className="mt-8 space-y-4">
          <div className="w-full h-12 bg-gray-200 rounded-lg" />
          <div className="w-full h-12 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
