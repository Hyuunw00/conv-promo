import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "검색",
  description: "편의점 프로모션을 검색하세요",
  alternates: {
    canonical: "/search",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
