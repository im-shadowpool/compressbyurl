import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/app/providers";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { getSiteUrl } from "@/config/site";

import "material-symbols/outlined.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "CompressByURL | Compress images from files or URLs",
    template: "%s | CompressByURL",
  },
  description:
    "Compress images from your device or a public URL. Fast, private, browser-first image optimization.",
  applicationName: "CompressByURL",
  keywords: ["image compressor", "compress image", "image URL", "web image optimization"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "CompressByURL",
    title: "Compress images from files or URLs",
    description:
      "A fast, private image optimizer that keeps local files in your browser.",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#3c315b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Providers>{children}</Providers>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
