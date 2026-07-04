// TASARIMIN CAN DAMARI (Bunu asla silmiyoruz)
import "./globals.css";

import type { Metadata, Viewport } from "next";

// UYGULAMANIN TELEFONDAKİ RENK VE EKRAN AYARLARI
export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// UYGULAMA KİMLİĞİ VE SEO AYARLARI
export const metadata: Metadata = {
  title: "Keser Catering Warehouse",
  description: "En yeni endüstriyel mutfak ekipmanları",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Keser",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Apple cihazlar (iPhone/iPad) için logo ayarı */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="bg-slate-50 text-slate-900">
        {children}
        
        {/* ARKA PLAN MOTORUNU (PWA) GÜVENLİCE ÇALIŞTIRAN KOD */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}