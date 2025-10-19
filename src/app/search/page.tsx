"use client";

import { useRouter } from "next/navigation";
import SearchContent from "@/components/search/search-content";
import ScrollToTop from "@/components/scroll-to-top";

export default function SearchPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <SearchContent onClose={() => router.push("/")} />
      <ScrollToTop />
    </div>
  );
}
