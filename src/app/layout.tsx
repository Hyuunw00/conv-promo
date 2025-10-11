import "@/styles/global.css";
import BottomNavigation from "@/components/layout/BottomNavigation";
import Script from "next/script";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body>
        <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
          {children}
          {modal}
          <BottomNavigation />
          <Toaster position="bottom-center" offset="80px" />
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
