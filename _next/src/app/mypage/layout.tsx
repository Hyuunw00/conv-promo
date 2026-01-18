import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "프로필 정보 및 설정을 관리하세요",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/mypage",
  },
};

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
