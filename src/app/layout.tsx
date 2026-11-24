import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Probewohnen · Wohnhaus der Baustoffe",
  description: "Probewohnen im Wohnhaus der Baustoffe, Aigen im Mühlkreis",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf8f4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-dvh flex flex-col font-serif antialiased">
        <main className=" flex-1 w-full max-w-xl mx-auto px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
