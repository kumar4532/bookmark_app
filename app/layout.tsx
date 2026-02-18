import "./globals.css";
import Providers from "./providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bookieshq.vercel.com"),
  title: {
    default: "BookiesHQ – Smart Bookmark Manager",
    template: "%s | BookiesHQ",
  },
  description:
    "BookiesHQ is a fast and minimal bookmark manager that helps you save, organize, and access your links from anywhere.",
  keywords: [
    "BookiesHQ",
    "bookmark manager",
    "save links",
    "link organizer",
    "bookmark store",
    "web bookmarks",
  ],
  openGraph: {
    title: "BookiesHQ – Smart Bookmark Manager",
    description:
      "Save, organize, and access your bookmarks from anywhere with BookiesHQ.",
    url: "https://bookieshq.com",
    siteName: "BookiesHQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookiesHQ – Smart Bookmark Manager",
    description:
      "A clean and powerful way to manage your bookmarks.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
