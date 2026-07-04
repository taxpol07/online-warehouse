// İŞTE SİLİNEN O SİHİRLİ KABLO BU SATIR:
import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keser Catering Warehouse",
  description: "En yeni endüstriyel mutfak ekipmanları",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}