import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, Search } from "lucide-react";
import { BRAND_LIST, BRAND_INFO } from "@/constants/brands";

interface HomeHeaderProps {
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  activeFilterCount?: number;
  onFilterClick?: () => void;
}

export default function HomeHeader({
  selectedBrand,
  onBrandChange,
  activeFilterCount = 0,
  onFilterClick,
}: HomeHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="px-4 py-3 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">편</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            편의점 털기
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onFilterClick}
            className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 text-gray-700" />
            {activeFilterCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/search")}
            className="p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* brand list */}
      <div className="flex px-2 overflow-x-auto no-scrollbar scroll-smooth bg-white">
        {BRAND_LIST.map((brandId) => (
          <button
            key={brandId}
            onClick={() => onBrandChange(brandId)}
            className={`flex-none px-4 py-3 text-sm font-medium transition-colors relative ${
              selectedBrand === brandId
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {BRAND_INFO[brandId as keyof typeof BRAND_INFO].name}
            {selectedBrand === brandId && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>
    </header>
  );
}
