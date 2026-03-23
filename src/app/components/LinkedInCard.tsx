"use client";

import type { MetaTags } from "../types";

interface LinkedInCardProps {
  meta: MetaTags;
  url: string;
}

export default function LinkedInCard({ meta, url }: LinkedInCardProps) {
  const title = meta.ogTitle || meta.title || "No title";
  const description = meta.ogDescription || meta.description || "";
  const image = meta.ogImage || meta.twitterImage || "";
  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  // Current LinkedIn organic design (2025):
  // Compact horizontal: small thumbnail LEFT, title + domain RIGHT
  // Border: 1px solid, ~8px radius
  // Text area background: #F3F2EF (warm gray) in light, ~#38434F in dark
  // Font: LinkedIn Sans / system fallback

  const fontStack =
    '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  return (
    <div className="preview-card">
      <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
        LinkedIn
      </h3>
      <div
        className="overflow-hidden rounded-lg border border-[#E0E0E0] dark:border-[#38434F] bg-white dark:bg-[#1D2226] max-w-[504px] flex"
        style={{ fontFamily: fontStack }}
      >
        {/* Thumbnail on left — grey placeholder with icon when no image (matches real LinkedIn) */}
        <div className="w-[128px] min-h-[72px] bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
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
        <div className="px-3 py-2.5 min-w-0 flex-1 bg-[#F3F2EF] dark:bg-[#38434F]">
          <p
            className="text-[14px] font-semibold leading-5 line-clamp-2"
            style={{ color: "rgba(0,0,0,0.9)" }}
          >
            <span className="dark:hidden">{title}</span>
            <span className="hidden dark:inline" style={{ color: "rgba(255,255,255,0.9)" }}>
              {title}
            </span>
          </p>
          {description && (
            <p
              className="text-[12px] leading-4 mt-0.5 line-clamp-1"
              style={{ color: "rgba(0,0,0,0.6)" }}
            >
              <span className="dark:hidden">{description}</span>
              <span className="hidden dark:inline" style={{ color: "rgba(255,255,255,0.6)" }}>
                {description}
              </span>
            </p>
          )}
          <p
            className="text-[12px] leading-4 mt-0.5"
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
