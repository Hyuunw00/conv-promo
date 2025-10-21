import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 페이지",
  description: "관리자 전용 페이지",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/admin",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
