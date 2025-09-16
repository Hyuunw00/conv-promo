import Loading from "@/components/ui/Loading";

export default function PopularLoading() {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">🔥 인기 프로모션</h1>
          <p className="text-xs text-gray-500 mt-0.5">지금 가장 핫한 행사들</p>
        </div>
        <div className="px-4 pb-3">
          <div className="flex gap-2">
            {["오늘", "이번주", "이번달"].map((label) => (
              <div
                key={label}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </header>
      <main className="px-3 pb-16 pt-3">
        <Loading />
      </main>
    </>
  );
}