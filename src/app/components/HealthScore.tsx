"use client";

import { useState, useEffect, useRef } from "react";
import type { MetaTags } from "../types";
import { META_TAG_LABELS, TAG_CHAR_LIMITS, TAG_RECOMMENDATIONS } from "../types";

interface HealthScoreProps {
  meta: MetaTags;
}

export default function HealthScore({ meta }: HealthScoreProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  // #4 Animated counter
  const [displayScore, setDisplayScore] = useState(0);
  const animatedRef = useRef(false);

  const checks = Object.entries(META_TAG_LABELS).map(([key, label]) => ({
    key,
    label,
    value: meta[key as keyof MetaTags] || "",
    present: !!meta[key as keyof MetaTags],
  }));

  const present = checks.filter((c) => c.present);
  const missing = checks.filter((c) => !c.present);
  const score = Math.round((present.length / checks.length) * 100);

  // #4 Animate score from 0 to actual value
  useEffect(() => {
    if (animatedRef.current) {
      setDisplayScore(score);
      return;
    }
    animatedRef.current = true;
    let start = 0;
    const duration = 600;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * score);
      setDisplayScore(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  const scoreColor =
    score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
  const ringColor =
    score >= 80 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-red-500";

  const copyToClipboard = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // Clipboard API not available
    }
  };

  // #1 Check character limits
  const getCharWarning = (key: string, value: string): string | null => {
    const limit = TAG_CHAR_LIMITS[key];
    if (!limit || !value) return null;
    if (value.length > limit.max) {
      return `${value.length} chars (recommended: ${limit.label})`;
    }
    return null;
  };

  // #6 Image dimension info
  const imageInfo = (() => {
    const w = meta.ogImageWidth;
    const h = meta.ogImageHeight;
    if (w && h) {
      const wi = parseInt(w, 10);
      const hi = parseInt(h, 10);
      if (isNaN(wi) || isNaN(hi)) return null;
      const meetsRecommended = wi >= 1200 && hi >= 630;
      return { width: wi, height: hi, meetsRecommended };
    }
    return null;
  })();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
        Meta Tag Health
      </h3>

      <div className="flex items-center gap-6 mb-6">
        {/* Score ring with animated counter */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <path
              className="stroke-neutral-200 dark:stroke-neutral-700"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={ringColor}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${score}, 100`}
              d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831"
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          </svg>
          <span
            className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${scoreColor}`}
          >
            {displayScore}%
          </span>
        </div>
        <div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            <span className={`font-semibold ${
              score >= 80
                ? "text-emerald-600 dark:text-emerald-400"
                : score >= 50
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
            }`}>
              {present.length}
            </span>{" "}
            of {checks.length} tags present
          </p>
          {missing.length > 0 && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Missing:{" "}
              {missing.map((m) => m.label).join(", ")}
            </p>
          )}
          {/* SPA limitation note */}
          {score <= 20 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Note: Some sites render meta tags via JavaScript (React, Vue, etc.) which
              server-side fetching cannot see. The actual tags may differ when viewed in a browser.
            </p>
          )}
        </div>
      </div>

      {/* #6 Image dimension info */}
      {meta.ogImage && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">og:image</span>
            {imageInfo ? (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                imageInfo.meetsRecommended
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
              }`}>
                {imageInfo.width}x{imageInfo.height}px
                {imageInfo.meetsRecommended ? " — meets recommended size" : " — recommended: 1200x630px"}
              </span>
            ) : (
              <span className="text-xs text-neutral-400">
                Dimensions not specified in meta tags (recommended: 1200x630px)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tag list */}
      <div className="space-y-1.5">
        {checks.map((check) => {
          const charWarning = getCharWarning(check.key, check.value);
          const recommendation = !check.present ? TAG_RECOMMENDATIONS[check.key] : null;
          const isExpanded = expandedKey === check.key;

          return (
            <div key={check.key}>
              <div
                className="flex items-center gap-3 py-2 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 group"
              >
                <span className="flex-shrink-0">
                  {check.present ? (
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 w-44 flex-shrink-0">
                  {check.label}
                </span>
                <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate flex-1 min-w-0">
                  {check.value || "—"}
                </span>

                {/* #1 Character count warning */}
                {charWarning && (
                  <span className="flex-shrink-0 text-xs text-amber-600 dark:text-amber-400 hidden sm:block">
                    {charWarning}
                  </span>
                )}

                {/* #3 Expand recommendation for missing tags */}
                {recommendation && (
                  <button
                    onClick={() => setExpandedKey(isExpanded ? null : check.key)}
                    className="flex-shrink-0 p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-150"
                    title="Show recommendation"
                  >
                    <svg
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}

                {/* Copy button */}
                {check.present && (
                  <button
                    onClick={() => copyToClipboard(check.key, check.value)}
                    className="sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0 p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-150"
                    title="Copy value"
                  >
                    {copiedKey === check.key ? (
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {/* #3 Expanded recommendation */}
              {isExpanded && recommendation && (
                <div className="ml-10 mt-1 mb-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 recommendation-expand">
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">
                    {recommendation}
                  </p>
                </div>
              )}

              {/* #1 Character warning on mobile (below the row) */}
              {charWarning && (
                <p className="ml-10 mt-0.5 text-xs text-amber-600 dark:text-amber-400 sm:hidden">
                  {charWarning}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
