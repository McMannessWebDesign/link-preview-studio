/**
 * SlackCard.tsx — Slack Preview Card (Client Component)
 *
 * Renders a mock-up of how a shared link appears as an "unfurl" in Slack messages.
 *
 * SLACK'S UNFURL FORMAT:
 * Slack's link previews have a distinctive left border (colored bar) with:
 * - A header row: favicon + site name (or domain if og:site_name is missing).
 * - A clickable title in Slack's blue link color.
 * - A description (up to ~3 lines, clipped).
 * - An image below the text. The image size depends on the twitter:card type:
 *   - "summary_large_image": Wide image (max-width 360px, max-height 200px).
 *   - Anything else (or no twitter:card): Small 75x75px thumbnail.
 *
 * META TAG FALLBACK CHAIN:
 * Slack primarily reads Open Graph tags, falling back to basic HTML meta tags:
 *   title: og:title → <title> → "No title"
 *   description: og:description → <meta name="description">
 *   image: og:image → twitter:image (Slack checks both)
 *   site name: og:site_name → domain hostname
 *   favicon: <link rel="icon"> (detected by our backend)
 *
 * STYLING:
 * Uses Slack's actual font stack (Lato) and color values. The left border is
 * neutral gray (Slack defaults to this when no accent color is specified in meta tags).
 */
"use client";

import type { MetaTags } from "../types";
import PreviewImage from "./PreviewImage";

interface SlackCardProps {
  meta: MetaTags;  // Extracted meta tags from the fetched URL
  url: string;     // Original URL (used to extract domain for display)
}

export default function SlackCard({ meta, url }: SlackCardProps) {
  // Slack's fallback chain: og tags first, then generic HTML tags
  const title = meta.ogTitle || meta.title || "No title";
  const description = meta.ogDescription || meta.description || "";
  const image = meta.ogImage || meta.twitterImage || "";
  const siteName = meta.siteName || "";  // og:site_name (e.g. "GitHub")
  const favicon = meta.favicon || "";    // Detected favicon URL from <link rel="icon">

  // Extract hostname for display when og:site_name isn't available
  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  // Slack uses twitter:card to decide image sizing: large cards get a wider image preview.
  const isLargeImage = meta.twitterCard === "summary_large_image";

  /*
   * RENDER:
   * - Section heading "Slack" above the card.
   * - Card background matches Slack's dark mode (#1A1D21) / light mode (white).
   * - border-l-4: The characteristic colored left bar of Slack unfurls.
   * - Favicon image uses onError to hide itself if the favicon URL is broken.
   * - Title is rendered as a clickable <a> link in Slack's blue color.
   * - Image section conditionally renders large or small based on twitter:card type.
   */
  return (
    <div className="preview-card">
      <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
        Slack
      </h3>
      {/* Outer card wrapper — Slack's background and font */}
      <div
        className="max-w-[504px] bg-white dark:bg-[#1A1D21] rounded-sm"
        style={{ fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif' }}
      >
        {/* The distinctive left colored border that marks Slack unfurls */}
        <div className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-3 pr-3 pb-3 pt-2">
          {/* Header: favicon + site name (or domain) */}
          <div className="flex items-center gap-1.5 mb-0.5">
            {favicon && (
              /*
               * Favicon image: Uses a plain <img> tag (not next/image) because the src
               * comes from an external domain we can't predict at build time.
               * eslint-disable is needed because next/image is normally required.
               * onError hides the image if the favicon URL is broken or returns a 404.
               */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={favicon}
                alt=""
                className="w-4 h-4 rounded-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <span className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">
              {siteName || domain}
            </span>
          </div>

          <a
            href={url}
            className="text-[15px] font-bold text-[#1264a3] dark:text-[#4a9fd9] hover:underline leading-snug block"
          >
            {title}
          </a>

          {description && (
            <p className="text-[15px] text-neutral-700 dark:text-neutral-300 line-clamp-3 leading-[22px] mt-0.5">
              {description}
            </p>
          )}

          {/* Large image: shown when twitter:card is "summary_large_image" */}
          {image && isLargeImage && (
            <div className="mt-2 max-w-[360px] rounded overflow-hidden">
              <PreviewImage src={image} className="max-h-[200px] w-auto rounded" />
            </div>
          )}
          {/* Small thumbnail: shown for "summary" card type or when no twitter:card is set */}
          {image && !isLargeImage && (
            <div className="mt-2 w-[75px] h-[75px] rounded overflow-hidden flex-shrink-0">
              <PreviewImage src={image} className="w-full h-full rounded" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
