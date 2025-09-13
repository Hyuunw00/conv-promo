import { BrandType } from "@/types/brand";

export const brandInfo = {
  ALL: {
    name: "전체",
    logo: null,
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
  CU: {
    name: "CU",
    logo: "/brands/cu.svg",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  GS25: {
    name: "GS25",
    logo: "/brands/gs25.webp",
    bgColor: "bg-sky-50",
    textColor: "text-sky-700",
  },
  SevenEleven: {
    name: "세븐일레븐",
    logo: "/brands/seveneleven.png",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
  Emart24: {
    name: "이마트24",
    logo: "/brands/emart24.webp",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
  },
} as const;

export const brands: BrandType[] = Object.keys(brandInfo) as BrandType[];
