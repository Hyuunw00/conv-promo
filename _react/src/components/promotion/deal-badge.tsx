import { getDealBadge } from "@/utils/style";

export default function DealBadge({
  dealType,
  size = "sm",
}: {
  dealType: string;
  size?: "sm" | "md";
}) {
  const badge = getDealBadge(dealType);
  if (!badge) return null;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${badge.style}`}
    >
      {badge.label}
    </span>
  );
}
