/**
 * TwitterCard.tsx — Twitter/X Preview Card (Client Component)
 *
 * Renders a visual mock-up of how a shared link will appear in Twitter/X posts.
 * Twitter supports two card layouts, and this component renders both:
 *
 * 1. LARGE IMAGE CARD ("summary_large_image"):
 *    - A wide image takes up the full card width (aspect ratio 504:252 ≈ 2:1).
 *    - The title is overlaid on the image bottom-left with a dark semi-transparent background.
 *    - The domain is shown below the card as "From example.com".
 *    - This layout is used when twitter:card is "summary_large_image" OR when an image exists.
 *
 * 2. SUMMARY CARD (small thumbnail):
 *    - A small square image on the left (144x144px), text on the right.
 *    - Shows domain, title, and description (up to 2 lines, clipped).
 *    - This layout is the fallback when there's no image.
 *
 * META TAG FALLBACK CHAIN:
 * Twitter has its own meta tags (twitter:title, twitter:image, etc.) but falls back to
 * Open Graph tags if Twitter-specific tags are missing, then falls back to the page <title>.
 * This component mirrors that same fallback logic:
 *   title: twitter:title → og:title → <title> → "No title"
 *   image: twitter:image → og:image → (empty)
 *
 * STYLING:
 * Uses Twitter's actual font stack (Chirp) and color values to match the real platform
 * as closely as possible, including dark mode variants using the dark: prefix.
 */
"use client";

import type { MetaTags } from "../types";
import PreviewImage from "./PreviewImage";

interface TwitterCardProps {
  meta: MetaTags;  // The extracted meta tags from the fetched URL
  url: string;     // The original URL (used to extract the domain name)
}

export default function TwitterCard({ meta, url }: TwitterCardProps) {
  // Apply Twitter's fallback chain: twitter-specific → og → generic
  const title = meta.twitterTitle || meta.ogTitle || meta.title || "No title";
  const image = meta.twitterImage || meta.ogImage || "";

  // Extract just the hostname for display (e.g. "github.com" from "https://github.com/user")
  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url; // If URL parsing fails, show the raw URL as fallback
    }
  })();

  // Twitter shows the large card format if twitter:card is "summary_large_image" or if any image exists.
  const isLargeCard = meta.twitterCard === "summary_large_image" || !!image;

  // Twitter's actual font stack — "Chirp" is their custom font, with system fonts as fallback.
  const fontStack = 'Chirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  /* ===== LARGE IMAGE CARD LAYOUT ===== */
  if (isLargeCard && image) {
    return (
      <div className="preview-card">
        <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
          Twitter / X
        </h3>
        <div className="max-w-[504px]">
          <div
            className="relative overflow-hidden rounded-2xl border border-[#CFD9DE] dark:border-[#2F3336] bg-white dark:bg-black"
            style={{ aspectRatio: "504/252" }}
          >
            <PreviewImage src={image} className="w-full h-full" />
            <div className="absolute bottom-3 left-3 max-w-[calc(100%-24px)]">
              <span
                className="inline-block px-2 py-0.5 text-[13px] leading-5 text-white bg-black/70 rounded truncate max-w-full"
                style={{ fontFamily: fontStack }}
              >
                {title}
              </span>
            </div>
          </div>
          <p
            className="text-[13px] text-[#536471] dark:text-[#71767B] mt-1.5"
            style={{ fontFamily: fontStack }}
          >
            From {domain}
          </p>
        </div>
      </div>
    );
  }

  /* ===== SUMMARY CARD LAYOUT (small thumbnail + text) ===== */
  const description =
    meta.twitterDescription || meta.ogDescription || meta.description || "";

  return (
    <div className="preview-card">
      <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
        Twitter / X
      </h3>
      <div className="max-w-[504px]">
        <div
          className="overflow-hidden rounded-2xl border border-[#CFD9DE] dark:border-[#2F3336] bg-white dark:bg-black flex"
          style={{ fontFamily: fontStack }}
        >
          {image && (
            <div className="w-[144px] min-h-[144px] bg-neutral-100 dark:bg-neutral-900 flex-shrink-0 overflow-hidden border-r border-[#CFD9DE] dark:border-[#2F3336]">
              <PreviewImage src={image} className="w-full h-full" />
            </div>
          )}
          <div className="px-3 py-2.5 min-w-0 flex flex-col justify-center">
            <p className="text-[13px] text-[#536471] dark:text-[#71767B] truncate">{domain}</p>
            <p className="text-[15px] text-[#0F1419] dark:text-[#E7E9EA] truncate leading-5 mt-0.5">{title}</p>
            {description && (
              <p className="text-[13px] text-[#536471] dark:text-[#71767B] line-clamp-2 leading-[18px] mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
