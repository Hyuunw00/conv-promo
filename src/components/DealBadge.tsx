import { DealType } from "@/types/deal";

export default function DealBadge({ deal }: { deal: DealType }) {
  deal === "ONE_PLUS_ONE" ? "1+1" : deal === "TWO_PLUS_ONE" ? "2+1" : "할인";
  const label =
    deal === "ONE_PLUS_ONE" ? "1+1" : deal === "TWO_PLUS_ONE" ? "2+1" : "할인";

  const style =
    deal === "ONE_PLUS_ONE"
      ? "bg-emerald-100 text-emerald-700"
      : deal === "TWO_PLUS_ONE"
      ? "bg-indigo-100 text-indigo-700"
      : "bg-amber-100 text-amber-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
