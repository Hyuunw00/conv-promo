import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data, error } = await supabase
    .from("promo_with_brand")
    .select("id, brand_name, title, category, deal_type, start_date, end_date")
    .order("start_date", { ascending: false })
    .limit(30);

  if (error) {
    console.error(error);
    return <main className="p-6">로드 중 오류가 발생했습니다.</main>;
  }

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">편의점 행사 모아보기</h1>

      <ul className="divide-y rounded border">
        {(data ?? []).map((p) => (
          <li key={p.id} className="p-3 flex items-start gap-3">
            <div className="text-sm text-gray-500 min-w-16">
              {(p as any).brand_name}
            </div>
            <div className="flex-1">
              <div className="font-medium">{(p as any).title}</div>
              <div className="text-sm text-gray-600">
                {(p as any).deal_type === "ONE_PLUS_ONE" && "1+1"}
                {(p as any).deal_type === "TWO_PLUS_ONE" && "2+1"}
                {(p as any).deal_type === "DISCOUNT" && "할인"}
                {" · "}
                {(p as any).category ?? "기타"}
              </div>
              <div className="text-xs text-gray-500">
                {new Date((p as any).start_date).toLocaleDateString()} ~{" "}
                {new Date((p as any).end_date).toLocaleDateString()}
              </div>
            </div>
          </li>
        ))}
        {(!data || data.length === 0) && (
          <li className="p-6 text-center text-gray-500">
            아직 등록된 행사가 없습니다.
          </li>
        )}
      </ul>
    </main>
  );
}
