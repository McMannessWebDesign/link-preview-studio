/**
 * layout.tsx — Root Layout (Server Component)
 *
 * This is the outermost layout that wraps every page in the app. In Next.js App Router,
 * layout.tsx files persist across navigations — they don't re-render when moving between
 * pages (though this app only has one page).
 *
 * KEY RESPONSIBILITIES:
 * 1. Defines the <html> and <body> tags (required in the root layout).
 * 2. Loads Google Fonts (Geist Sans + Geist Mono) using next/font, which:
 *    - Self-hosts the fonts (no external requests to Google at runtime).
 *    - Generates CSS custom properties (--font-geist-sans, --font-geist-mono)
 *      that Tailwind and components can reference.
 * 3. Exports the `metadata` object which Next.js uses to generate <head> tags:
 *    - <title> and <meta name="description"> for SEO.
 *    - Open Graph tags so the app itself previews nicely when shared on social media.
 *    - Twitter card tags for X/Twitter previews.
 *    This is a Server Component feature — metadata can't be exported from Client Components.
 * 4. Imports globals.css which contains Tailwind's base/components/utilities layers.
 *
 * NOTE: This file is NOT marked "use client" — it runs on the server. The `children` prop
 * is where page.tsx (a Client Component) gets rendered. Server and Client Components can
 * be mixed this way in the App Router.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * Font loading: next/font/google downloads the font files at build time and serves them
 * from the same domain (no layout shift, no external requests). The `variable` option
 * creates a CSS custom property we can use in Tailwind config or inline styles.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata export: Next.js reads this object and generates the appropriate <head> tags.
 * This controls how the app appears in search results and when shared on social platforms.
 * Since this is a link preview tool, it's especially important that our OWN meta tags are solid.
 */
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

/**
 * RootLayout: The shell that wraps all pages.
 * - `lang="en"` sets the document language for accessibility and SEO.
 * - Font CSS variables are applied to <html> so they cascade to all elements.
 * - `antialiased` enables font smoothing for cleaner text rendering.
 * - `min-h-full flex flex-col` on <body> ensures the footer sticks to the bottom
 *   even on short pages (the main content uses flex-1 to fill available space).
 */
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
