"use client";

import { useSearchParams, useRouter } from "next/navigation";

interface PopularClientProps {
  initialFilter: string;
}

export default function PopularClient({ initialFilter }: PopularClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const timeFilter = (searchParams.get("filter") || initialFilter) as "today" | "week" | "month";

  const handleFilterChange = (filterId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", filterId);
    router.push(`/popular?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="px-4 pb-3">
      <div className="flex gap-2">
        {[
          { id: "today", label: "오늘" },
          { id: "week", label: "이번주" },
          { id: "month", label: "이번달" },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterChange(filter.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              timeFilter === filter.id
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}