/**
 * types.ts — Shared TypeScript Types & Constants
 *
 * This file defines the data structures and reference data used across the entire app.
 * It is NOT a component — it contains only types, interfaces, and constant objects.
 *
 * IMPORTED BY:
 * - page.tsx (main page uses FetchResult, HistoryEntry)
 * - HealthScore.tsx (uses META_TAG_LABELS, TAG_CHAR_LIMITS, TAG_RECOMMENDATIONS)
 * - TwitterCard.tsx, SlackCard.tsx, LinkedInCard.tsx (use MetaTags)
 * - History.tsx (uses HistoryEntry)
 * - The API route (fetch-meta/route.ts) also uses MetaTags for its response shape
 */

/**
 * MetaTags: The complete set of meta tag values extracted from a fetched URL.
 *
 * These fields map to specific HTML meta tags or elements:
 * - title:              The content of the <title> element.
 * - description:        <meta name="description" content="...">
 * - ogTitle:            <meta property="og:title" content="...">
 * - ogDescription:      <meta property="og:description" content="...">
 * - ogImage:            <meta property="og:image" content="..."> (resolved to absolute URL)
 * - ogImageWidth:       <meta property="og:image:width" content="...">
 * - ogImageHeight:      <meta property="og:image:height" content="...">
 * - ogUrl:              <meta property="og:url" content="...">
 * - twitterCard:        <meta name="twitter:card" content="..."> (e.g. "summary_large_image")
 * - twitterTitle:       <meta name="twitter:title" content="...">
 * - twitterDescription: <meta name="twitter:description" content="...">
 * - twitterImage:       <meta name="twitter:image" content="..."> (resolved to absolute URL)
 * - favicon:            Detected from <link rel="icon"> or falls back to /favicon.ico
 * - siteName:           <meta property="og:site_name" content="...">
 * - themeColor:         <meta name="theme-color" content="...">
 *
 * All fields are strings. Empty string ("") means the tag was not found on the page.
 */
export interface MetaTags {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageWidth: string;
  ogImageHeight: string;
  ogUrl: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  favicon: string;
  siteName: string;
  themeColor: string;
}

/**
 * FetchResult: The shape of a successful API response from /api/fetch-meta.
 *
 * - url:       The URL that was fetched (may have been normalized, e.g. "https://" prepended).
 * - finalUrl:  If the URL was redirected, this is the final destination URL.
 *              Undefined if no redirect occurred (url === finalUrl).
 * - meta:      The extracted meta tags (see MetaTags above).
 * - fetchedAt: ISO 8601 timestamp of when the fetch was performed (server time).
 */
export interface FetchResult {
  url: string;
  finalUrl?: string;
  meta: MetaTags;
  fetchedAt: string;
}

/**
 * HistoryEntry: A cached result stored in localStorage for the "Recent Checks" list.
 * Same as FetchResult but without finalUrl (not needed for history display).
 *
 * - url:       The URL that was fetched.
 * - meta:      The extracted meta tags (used to display title, favicon in history list,
 *              and to restore the full result when the user clicks a history entry).
 * - fetchedAt: ISO timestamp used to show relative time ("5m ago", "2h ago", etc.).
 */
export interface HistoryEntry {
  url: string;
  meta: MetaTags;
  fetchedAt: string;
}

/**
 * META_TAG_LABELS: Maps MetaTags field names to human-readable labels.
 *
 * Used by HealthScore.tsx to display the tag-by-tag breakdown. Only the tags listed
 * here are evaluated for the health score — some MetaTags fields (ogImageWidth,
 * ogImageHeight, favicon, siteName, themeColor) are informational only and don't
 * affect the score because they're not critical for link previews.
 */
export const META_TAG_LABELS: Record<string, string> = {
  title: "Page <title>",
  description: '<meta name="description">',
  ogTitle: "og:title",
  ogDescription: "og:description",
  ogImage: "og:image",
  ogUrl: "og:url",
  twitterCard: "twitter:card",
  twitterTitle: "twitter:title",
  twitterDescription: "twitter:description",
  twitterImage: "twitter:image",
};

/**
 * TAG_CHAR_LIMITS: Recommended maximum character lengths for specific meta tags.
 *
 * These limits are based on where platforms truncate content:
 * - title / og:title: Google truncates at ~60 chars in search results.
 * - description / og:description: Google truncates at ~160 chars.
 * - twitter:title: X/Twitter truncates at ~70 chars.
 * - twitter:description: X/Twitter allows up to ~200 chars.
 *
 * Used by HealthScore.tsx to show character count warnings when a tag exceeds its limit.
 * Tags not listed here (like og:image, og:url) have no character limit check.
 */
export const TAG_CHAR_LIMITS: Record<string, { max: number; label: string }> = {
  title: { max: 60, label: "60 chars" },
  description: { max: 160, label: "160 chars" },
  ogTitle: { max: 60, label: "60 chars" },
  ogDescription: { max: 160, label: "160 chars" },
  twitterTitle: { max: 70, label: "70 chars" },
  twitterDescription: { max: 200, label: "200 chars" },
};

/**
 * TAG_RECOMMENDATIONS: Help text shown for each missing meta tag.
 *
 * When a tag is missing (not present on the page), HealthScore.tsx can display an
 * expandable recommendation explaining what the tag does and why it should be added.
 * Each recommendation includes practical advice (recommended sizes, fallback behavior, etc.).
 *
 * Used by the expand/collapse chevron button in the HealthScore tag breakdown list.
 */
export const TAG_RECOMMENDATIONS: Record<string, string> = {
  title: "Add a <title> tag. This is the most important tag for SEO and appears in browser tabs.",
  description: "Add a meta description. Search engines display this in results (aim for 150-160 chars).",
  ogTitle: "Add og:title for social sharing. Without it, platforms fall back to <title> which may not be optimized for social.",
  ogDescription: "Add og:description. This controls the description shown on Facebook, LinkedIn, and Slack previews.",
  ogImage: "Add og:image (recommended 1200x630px). Posts with images get significantly more engagement on social media.",
  ogUrl: "Add og:url to specify the canonical URL. This helps platforms resolve duplicate content.",
  twitterCard: 'Add twitter:card (set to "summary_large_image" for best visibility). Without it, X/Twitter may not show a preview.',
  twitterTitle: "Add twitter:title for X/Twitter. Without it, X falls back to og:title or <title>.",
  twitterDescription: "Add twitter:description for X/Twitter previews. Shown on summary cards.",
  twitterImage: "Add twitter:image for X/Twitter. Without it, X falls back to og:image.",
};
