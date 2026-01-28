import type { NextConfig } from "next";
// PWA 관련 코드 주석처리 - 제대로 이해하고 다시 적용 예정
// import withSerwistInit from "@serwist/next";

// const withSerwist = withSerwistInit({
//   swSrc: "src/sw.ts",
//   swDest: "public/sw.js",
//   disable: process.env.NODE_ENV === "development",
//   cacheOnNavigation: true,
//   reloadOnOnline: true,
// });

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 85, 90],
  },
  experimental: {
    reactCompiler: true, // Next.js 15에서는 아직 experimental이지만 실제로는 활성화되어 있음
  },
};

// PWA 래핑 제거
export default nextConfig;
