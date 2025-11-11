import "@/styles/global.css";
import BottomNavigation from "@/components/layout/BottomNavigation";
import NotificationPromptAuto from "@/components/notifications/NotificationPromptAuto";
import AppInstallBanner from "@/components/notifications/AppInstallBanner";
import SplashScreen from "@/components/splash-screen";
import Script from "next/script";
import { Toaster } from "sonner";
import type { Metadata } from "next";

// SEO 메타데이터
export const metadata: Metadata = {
  title: {
    default: "편털 - 편의점 행사 모아보기",
    template: "%s | 편털",
  },
  description:
    "GS25, CU, 세븐일레븐, 이마트24의 모든 프로모션을 한 곳에서! 1+1, 2+1 행사를 실시간으로 확인하고 저장하세요.",
  keywords: [
    "편의점",
    "프로모션",
    "행사",
    "1+1",
    "2+1",
    "GS25",
    "CU",
    "세븐일레븐",
    "이마트24",
    "편의점 행사",
  ],
  authors: [{ name: "편털" }],
  creator: "편털",
  publisher: "편털",
  applicationName: "편털 - 편의점 행사 모아보기",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://conv-promo.vercel.app"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "편털 - 편의점 행사 모아보기",
    description:
      "GS25, CU, 세븐일레븐, 이마트24의 모든 프로모션을 한 곳에서! 1+1, 2+1 행사를 실시간으로 확인하고 저장하세요.",
    siteName: "편털",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "편털",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "편털 - 편의점 행사 모아보기",
    description: "GS25, CU, 세븐일레븐, 이마트24의 모든 프로모션을 한 곳에서!",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "U6mXUkeuHGJWad2dyFSsSitnssMie1I_bF8UnjRIIQ8",
  },
  other: {
    "naver-site-verification": "c361986aabf1ce0a847d21c75c5483641761b79f",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        {/* Structured Data for SEO */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "편털 - 편의점 행사 모아보기",
              description:
                "GS25, CU, 세븐일레븐, 이마트24의 모든 프로모션을 한 곳에서",
              url:
                process.env.NEXT_PUBLIC_BASE_URL ||
                "https://conv-promo.vercel.app",
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Any",
              // offers: {
              //   "@type": "Offer",
              //   price: "0",
              //   priceCurrency: "KRW",
              // },
              // aggregateRating: {
              //   "@type": "AggregateRating",
              //   ratingValue: "4.5",
              //   ratingCount: "100",
              // },
            }),
          }}
        />

        <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
          <div className="statusbar-overlay" />
          <SplashScreen />
          {children}
          <BottomNavigation />
          <AppInstallBanner />
          <NotificationPromptAuto />
          <Toaster position="top-center" />
        </div>
        {process.env.NODE_ENV === "development" && (
          <Script id="unregister-sw" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
              }
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
