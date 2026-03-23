"use client";

import type { MetaTags } from "../types";

interface TwitterCardProps {
  meta: MetaTags;
  url: string;
}

export default function TwitterCard({ meta, url }: TwitterCardProps) {
  const title = meta.twitterTitle || meta.ogTitle || meta.title || "No title";
  const image = meta.twitterImage || meta.ogImage || "";
  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();
  const isLargeCard = meta.twitterCard === "summary_large_image" || !!image;

  // Current X/Twitter design (2025):
  // summary_large_image: full-width image, title overlaid as pill at bottom-left, domain below card
  // summary: square thumbnail left, title + description right

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Title overlay pill at bottom-left */}
            <div className="absolute bottom-3 left-3 max-w-[calc(100%-24px)]">
              <span
                className="inline-block px-2 py-0.5 text-[13px] leading-5 text-white bg-black/70 rounded truncate max-w-full"
                style={{
                  fontFamily:
                    'Chirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                {title}
              </span>
            </div>
          </div>
          {/* Domain below card */}
          <p
            className="text-[13px] text-[#536471] dark:text-[#71767B] mt-1.5"
            style={{
              fontFamily:
                'Chirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
          >
            From {domain}
          </p>
        </div>
      </div>
    );
  }

  // summary card (small): square thumbnail left, text right
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
          style={{
            fontFamily:
              'Chirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          }}
        >
          {image && (
            <div className="w-[144px] min-h-[144px] bg-neutral-100 dark:bg-neutral-900 flex-shrink-0 overflow-hidden border-r border-[#CFD9DE] dark:border-[#2F3336]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <div className="px-3 py-2.5 min-w-0 flex flex-col justify-center">
            <p className="text-[13px] text-[#536471] dark:text-[#71767B] truncate">
              {domain}
            </p>
            <p className="text-[15px] text-[#0F1419] dark:text-[#E7E9EA] truncate leading-5 mt-0.5">
              {title}
            </p>
            {description && (
              <p className="text-[13px] text-[#536471] dark:text-[#71767B] line-clamp-2 leading-[18px] mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
