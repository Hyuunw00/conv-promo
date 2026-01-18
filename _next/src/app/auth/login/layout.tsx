import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description: "편털에 로그인하여 프로모션을 저장하고 관리하세요",
  alternates: {
    canonical: "/auth/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
