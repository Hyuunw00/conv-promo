import NearbyClient from "./NearbyClient";
import ScrollToTop from "@/components/scroll-to-top";

export const metadata = {
  title: "내 주변 편의점 | 편의점 프로모션",
  description: "내 주변 편의점을 찾아보세요",
};

export default function NearbyPage() {
  return (
    <>
      <NearbyClient />
      <ScrollToTop />
    </>
  );
}
