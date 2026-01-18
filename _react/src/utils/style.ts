export const getBrandStyle = (brandName: string) => {
  switch (brandName) {
    case "CU":
      return "bg-green-100 text-green-700 border-green-200";
    case "GS25":
      return "bg-sky-100 text-sky-700 border-sky-200";
    case "SevenEleven":
      return "bg-red-100 text-red-700 border-red-200";
    case "Emart24":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export const getDealBadge = (dealType: string) => {
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
