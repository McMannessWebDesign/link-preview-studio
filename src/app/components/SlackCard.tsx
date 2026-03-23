"use client";

import type { MetaTags } from "../types";
import PreviewImage from "./PreviewImage";

interface SlackCardProps {
  meta: MetaTags;
  url: string;
}

export default function SlackCard({ meta, url }: SlackCardProps) {
  const title = meta.ogTitle || meta.title || "No title";
  const description = meta.ogDescription || meta.description || "";
  const image = meta.ogImage || meta.twitterImage || "";
  const siteName = meta.siteName || "";
  const favicon = meta.favicon || "";
  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();
  const isLargeImage = meta.twitterCard === "summary_large_image";

  return (
    <div className="preview-card">
      <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
        Slack
      </h3>
      <div
        className="max-w-[504px] bg-white dark:bg-[#1A1D21] rounded-sm"
        style={{ fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif' }}
      >
        <div className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            {favicon && (
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

          {image && isLargeImage && (
            <div className="mt-2 max-w-[360px] rounded overflow-hidden">
              <PreviewImage src={image} className="max-h-[200px] w-auto rounded" />
            </div>
          )}
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
