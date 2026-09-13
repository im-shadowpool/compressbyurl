import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/app/providers";

import "material-symbols/outlined.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "CompressByURL | Compress images from files or URLs",
    template: "%s | CompressByURL",
  },
  description:
    "Compress images from your device or a public URL. Fast, private, browser-first image optimization.",
  applicationName: "CompressByURL",
  keywords: ["image compressor", "compress image", "image URL", "web image optimization"],
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
      </body>
    </html>
  );
}
