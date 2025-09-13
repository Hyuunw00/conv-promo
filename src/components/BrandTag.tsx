type Props = { name: string };

const brandStyle = (name: string) => {
  switch (name) {
    case "CU":
      return "bg-purple-100 text-purple-700";
    case "GS25":
      return "bg-sky-100 text-sky-700";
    case "SevenEleven":
      return "bg-green-100 text-green-700";
    case "Emart24":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function BrandTag({ name }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${brandStyle(
        name
      )}`}
    >
      {name}
    </span>
  );
}
