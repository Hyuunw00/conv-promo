const getBrandStyle = (brandName: string) => {
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

export default function BrandBadge({ brandName }: { brandName: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getBrandStyle(
        brandName
      )}`}
    >
      {brandName}
    </span>
  );
}
