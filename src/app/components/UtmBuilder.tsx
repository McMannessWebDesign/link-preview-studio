"use client";

import { useState, useMemo } from "react";

interface UtmBuilderProps {
  baseUrl: string;
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

const EMPTY: UtmParams = { source: "", medium: "", campaign: "", term: "", content: "" };

function buildUtmUrl(baseUrl: string, params: UtmParams): string {
  try {
    const url = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
    if (params.source) url.searchParams.set("utm_source", params.source);
    if (params.medium) url.searchParams.set("utm_medium", params.medium);
    if (params.campaign) url.searchParams.set("utm_campaign", params.campaign);
    if (params.term) url.searchParams.set("utm_term", params.term);
    if (params.content) url.searchParams.set("utm_content", params.content);
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export default function UtmBuilder({ baseUrl, onSubmit, isLoading }: UtmBuilderProps) {
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState<UtmParams>(EMPTY);

  const set = (key: keyof UtmParams) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setParams((prev) => ({ ...prev, [key]: e.target.value }));

  const builtUrl = useMemo(() => buildUtmUrl(baseUrl, params), [baseUrl, params]);

  const hasAnyParam = Object.values(params).some((v) => v.trim() !== "");
  const canPreview = hasAnyParam && baseUrl.trim() !== "";

  const handlePreview = () => {
    if (canPreview) onSubmit(builtUrl);
  };

  if (!baseUrl.trim()) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        UTM parameters
      </button>

      {open && (
        <div className="mt-3 p-4 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-4">
          {/* Required fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["source", "medium", "campaign"] as const).map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  utm_{key}
                  <span className="text-neutral-400 dark:text-neutral-600 font-normal ml-1">
                    {key === "source" && "(e.g. twitter)"}
                    {key === "medium" && "(e.g. social)"}
                    {key === "campaign" && "(e.g. spring-sale)"}
                  </span>
                </label>
                <input
                  type="text"
                  value={params[key]}
                  onChange={set(key)}
                  placeholder={key === "source" ? "twitter" : key === "medium" ? "social" : "campaign-name"}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150"
                />
              </div>
            ))}
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["term", "content"] as const).map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  utm_{key}{" "}
                  <span className="text-neutral-400 dark:text-neutral-600 font-normal">
                    {key === "term" ? "(paid search keyword)" : "(A/B variant)"}
                  </span>
                </label>
                <input
                  type="text"
                  value={params[key]}
                  onChange={set(key)}
                  placeholder={key === "term" ? "running+shoes" : "hero-banner"}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150"
                />
              </div>
            ))}
          </div>

          {/* Preview + actions */}
          {hasAnyParam && (
            <div className="space-y-3 pt-1">
              <div className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-1">Built URL</p>
                <p className="text-xs font-mono text-neutral-700 dark:text-neutral-300 break-all leading-relaxed">
                  {builtUrl}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white font-medium rounded-lg transition-colors duration-150 disabled:cursor-not-allowed"
                >
                  Preview with UTM
                </button>
                <button
                  type="button"
                  onClick={() => setParams(EMPTY)}
                  className="px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-150"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
