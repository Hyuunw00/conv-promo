const getDealBadge = (dealType: string) => {
  if (!dealType) return null;

  const badges: Record<string, { label: string; style: string }> = {
    ONE_PLUS_ONE: {
      label: "1+1",
      style: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
    },
    TWO_PLUS_ONE: {
      label: "2+1",
      style: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
    },
    DISCOUNT: {
      label: "할인",
      style: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
    },
  };

  const badge = badges[dealType];
  if (!badge) return null;

  return badge;
};

export default function DealBadge({ dealType }: { dealType: string }) {
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
