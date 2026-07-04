import type { Metadata, Viewport } from "next";

// YENİ: Renk ve cihaz ayarları
export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Keser Catering",
  description: "Premier commercial catering warehouse",
  manifest: "/manifest.json", // BU SATIR ÇOK ÖNEMLİ
  icons: {
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
