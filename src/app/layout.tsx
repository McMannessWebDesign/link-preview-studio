import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Link Preview Studio",
  description:
    "Check how your URLs appear when shared on Twitter/X, Slack, and LinkedIn. Extract and validate Open Graph meta tags.",
  openGraph: {
    title: "Link Preview Studio",
    description:
      "Paste any URL and instantly preview how it appears on Twitter/X, Slack, and LinkedIn. Check your Open Graph meta tags.",
    url: "https://link-preview-studio.onrender.com",
    siteName: "Link Preview Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Link Preview Studio",
    description:
      "Paste any URL and instantly preview how it appears on Twitter/X, Slack, and LinkedIn.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
