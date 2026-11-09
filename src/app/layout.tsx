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
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "https://cagar-budaya.vercel.app"
  ),
  title: "Cagar Budaya GPIB — Inventarisasi & Peta Sebaran",
  description:
    "Inventarisasi resmi 35 bangunan cagar budaya Gereja Protestan di Indonesia bagian Barat (GPIB) — Merawat Warisan, Menjadi Berkat.",
  keywords: ["GPIB", "Cagar Budaya", "Gereja Bersejarah", "Sejarah GPIB", "Inventarisasi Bangunan", "Peta Cagar Budaya", "Warisan Budaya"],
  authors: [{ name: "GPIB Heritage Team" }],
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "256x256", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "Cagar Budaya GPIB — Merawat Warisan, Menjadi Berkat",
    description: "Dokumentasi kuratorial & peta sebaran 35 bangunan cagar budaya bersejarah GPIB di seluruh Indonesia.",
    type: "website",
    locale: "id_ID",
    siteName: "Cagar Budaya GPIB",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Cagar Budaya GPIB — Merawat Warisan, Menjadi Berkat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cagar Budaya GPIB — Merawat Warisan, Menjadi Berkat",
    description: "Dokumentasi kuratorial & peta sebaran 35 bangunan cagar budaya bersejarah GPIB di seluruh Indonesia.",
    images: ["/og-image.jpg"],
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
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${fraunces.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable} h-full dark`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
