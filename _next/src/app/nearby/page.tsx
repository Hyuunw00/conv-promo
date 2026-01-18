import NearbyClient from "./client";
import ScrollToTop from "@/components/scroll-to-top";

export const metadata = {
  title: "내 주변 편의점",
  description: "내 위치 기반으로 가까운 GS25, CU, 세븐일레븐, 이마트24 편의점을 찾아보세요. 실시간 위치 정보로 가장 가까운 매장을 확인할 수 있습니다.",
  alternates: {
    canonical: "/nearby",
  },
};

export default function NearbyPage() {
  return (
    <>
      <NearbyClient />
      <ScrollToTop />
    </>
  );
}
