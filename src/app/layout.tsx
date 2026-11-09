import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cagar Budaya GPIB — Inventarisasi & Peta Sebaran",
  description:
    "Inventarisasi resmi 35 bangunan cagar budaya Gereja Protestan di Indonesia bagian Barat (GPIB) beserta status penetapan, surat keputusan, narasi sejarah, galeri foto, dan peta sebarannya.",
  keywords: ["GPIB", "Cagar Budaya", "Gereja Bersejarah", "Sejarah GPIB", "Inventarisasi Bangunan", "Peta Cagar Budaya"],
  authors: [{ name: "GPIB Heritage Team" }],
  openGraph: {
    title: "Cagar Budaya GPIB — Inventarisasi & Peta Sebaran",
    description: "Dokumentasi & inventarisasi 35 bangunan cagar budaya bersejarah GPIB di seluruh Indonesia.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable} h-full dark`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased bg-[#0f0e0c] text-[#f2eee6]">
        {children}
      </body>
    </html>
  );
}
