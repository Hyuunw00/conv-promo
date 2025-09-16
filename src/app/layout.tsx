import "@/styles/global.css";
import BottomNavigation from "@/components/layout/BottomNavigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#111827" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        {/* <meta name="apple-mobile-web-app-capable" content="yes" /> */}
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body>
        <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
          {children}
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
