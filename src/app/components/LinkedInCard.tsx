/**
 * LinkedInCard.tsx — LinkedIn Preview Card (Client Component)
 *
 * Renders a mock-up of how a shared link appears in LinkedIn feed posts.
 *
 * LINKEDIN'S LINK PREVIEW FORMAT:
 * LinkedIn uses a horizontal card layout with:
 * - A square-ish thumbnail image on the left (128px wide).
 *   - If no image is available, a placeholder icon is shown instead.
 * - A text section on the right with a light gray background (#F3F2EF):
 *   - Title (bold, up to 2 lines, clipped).
 *   - Description (smaller text, single line, clipped).
 *   - Domain name at the bottom.
 *
 * META TAG FALLBACK CHAIN:
 * LinkedIn primarily reads Open Graph tags:
 *   title: og:title → <title> → "No title"
 *   description: og:description → <meta name="description">
 *   image: og:image → twitter:image
 *
 * DARK MODE HANDLING:
 * LinkedIn's actual dark mode uses rgba colors. Since Tailwind's `dark:` prefix
 * toggles classes and can't directly set rgba via inline styles, this component uses
 * a dual-span technique: one <span> for light mode, one <span> hidden until dark mode.
 * This ensures the text colors match LinkedIn's actual dark theme.
 */
"use client";

import type { MetaTags } from "../types";
import PreviewImage from "./PreviewImage";

interface LinkedInCardProps {
  meta: MetaTags;  // Extracted meta tags from the fetched URL
  url: string;     // Original URL (used to extract domain for display)
}

export default function LinkedInCard({ meta, url }: LinkedInCardProps) {
  // LinkedIn's fallback chain: og tags first, then generic HTML tags
  const baseTitle = meta.ogTitle || meta.title || "No title";
  // LinkedIn appends " · {site_name}" to the title (e.g. "GitHub · Keep... · GitHub")
  const title = meta.siteName ? `${baseTitle} · ${meta.siteName}` : baseTitle;
  const image = meta.ogImage || meta.twitterImage || "";

  // Extract hostname for display at the bottom of the card
  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  // LinkedIn's system font stack (they don't use a custom font like Twitter's Chirp)
  const fontStack =
    '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  /*
   * RENDER:
   * - Section heading "LinkedIn" above the card.
   * - Horizontal flex layout: image left, text right.
   * - The text section has LinkedIn's characteristic light gray background.
   * - Each text element uses the dual-span dark mode technique described above:
   *   one span visible in light mode, one hidden span visible in dark mode,
   *   each with appropriate rgba colors matching LinkedIn's actual theme.
   */
  return (
    <div className="preview-card">
      <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
        LinkedIn
      </h3>
      {/* Card container — horizontal flex with image left, text right */}
      <div
        className="overflow-hidden rounded-lg border border-[#E0E0E0] dark:border-[#38434F] bg-white dark:bg-[#1D2226] max-w-[504px] flex"
        style={{ fontFamily: fontStack }}
      >
        {/*
          Thumbnail section (left side):
          - Fixed 128px width with the image covering the full area.
          - If no og:image is available, shows a gray placeholder with a link icon
            to match LinkedIn's actual behavior when a page has no preview image.
        */}
        <div className="w-[100px] h-[100px] self-center bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {image ? (
            <PreviewImage src={image} className="w-full h-full" />
          ) : (
            <svg
              className="w-8 h-8 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          )}
        </div>

        {/* Text area on right */}
        <div className="px-3 py-2.5 min-w-0 flex-1 bg-white dark:bg-[#38434F]">
          <p
            className="text-[14px] font-semibold leading-5 line-clamp-2"
            style={{ color: "rgba(0,0,0,0.9)" }}
          >
            <span className="dark:hidden">{title}</span>
            <span className="hidden dark:inline" style={{ color: "rgba(255,255,255,0.9)" }}>
              {title}
            </span>
          </p>
          <p
            className="text-[12px] leading-4 mt-1"
            style={{ color: "rgba(0,0,0,0.6)" }}
          >
            <span className="dark:hidden">{domain}</span>
            <span className="hidden dark:inline" style={{ color: "rgba(255,255,255,0.6)" }}>
              {domain}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
