"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { FetchResult, HistoryEntry } from "./types";
import { META_TAG_LABELS } from "./types";
import UrlInput from "./components/UrlInput";
import TwitterCard from "./components/TwitterCard";
import SlackCard from "./components/SlackCard";
import LinkedInCard from "./components/LinkedInCard";
import HealthScore from "./components/HealthScore";
import History from "./components/History";
import DarkModeToggle from "./components/DarkModeToggle";
import ErrorMessage from "./components/ErrorMessage";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ExampleUrls from "./components/ExampleUrls";

const HISTORY_KEY = "lps-history";
const MAX_HISTORY = 10;

export default function Home() {
  const [inputUrl, setInputUrl] = useState("");
  const [result, setResult] = useState<FetchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const requestIdRef = useRef(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // localStorage unavailable or corrupt
    }
  }, []);

  // #11 Update tab title when viewing results
  useEffect(() => {
    if (result) {
      const title = result.meta.ogTitle || result.meta.title || "";
      const domain = (() => {
        try { return new URL(result.url).hostname; } catch { return ""; }
      })();
      document.title = title
        ? `${title} — Link Preview Studio`
        : `${domain} — Link Preview Studio`;
    } else {
      document.title = "Link Preview Studio";
    }
  }, [result]);

  const saveHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
    } catch {
      // localStorage full or unavailable
    }
  }, []);

  const addToHistory = useCallback(
    (entry: HistoryEntry) => {
      const filtered = history.filter((h) => h.url !== entry.url);
      const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
      saveHistory(updated);
    },
    [history, saveHistory]
  );

  const handleSubmit = async (url: string) => {
    const thisRequestId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/fetch-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (thisRequestId !== requestIdRef.current) return;

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An unexpected error occurred.");
        return;
      }

      setResult(data);
      setInputUrl(data.url);

      addToHistory({
        url: data.url,
        meta: data.meta,
        fetchedAt: data.fetchedAt,
      });
    } catch {
      if (thisRequestId !== requestIdRef.current) return;
      setError("Network error. Please check your connection and try again.");
    } finally {
      if (thisRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  // #7 Example URL handler
  const handleExampleSelect = (url: string) => {
    setInputUrl(url);
    handleSubmit(url);
  };

  const handleHistorySelect = (entry: HistoryEntry) => {
    setResult({
      url: entry.url,
      meta: entry.meta,
      fetchedAt: entry.fetchedAt,
    });
    setInputUrl(entry.url);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  // #8 Copy all meta tags as HTML snippet
  const handleCopyMetaHtml = async () => {
    if (!result) return;
    const lines: string[] = [];
    const m = result.meta;
    if (m.title) lines.push(`<title>${m.title}</title>`);
    if (m.description) lines.push(`<meta name="description" content="${m.description}">`);
    if (m.ogTitle) lines.push(`<meta property="og:title" content="${m.ogTitle}">`);
    if (m.ogDescription) lines.push(`<meta property="og:description" content="${m.ogDescription}">`);
    if (m.ogImage) lines.push(`<meta property="og:image" content="${m.ogImage}">`);
    if (m.ogUrl) lines.push(`<meta property="og:url" content="${m.ogUrl}">`);
    if (m.twitterCard) lines.push(`<meta name="twitter:card" content="${m.twitterCard}">`);
    if (m.twitterTitle) lines.push(`<meta name="twitter:title" content="${m.twitterTitle}">`);
    if (m.twitterDescription) lines.push(`<meta name="twitter:description" content="${m.twitterDescription}">`);
    if (m.twitterImage) lines.push(`<meta name="twitter:image" content="${m.twitterImage}">`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const showExamples = !result && !error && !isLoading && history.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Link Preview Studio
            </h1>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Preview how your links appear everywhere
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
            Paste a URL to see its Open Graph meta tags and preview how it looks
            when shared on Twitter/X, Slack, and LinkedIn.
          </p>
        </div>

        {/* URL Input */}
        <div className="mb-8">
          <UrlInput url={inputUrl} onUrlChange={setInputUrl} onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* #7 Example URLs for first-time users */}
        {showExamples && (
          <div className="mb-8">
            <ExampleUrls onSelect={handleExampleSelect} />
          </div>
        )}

        {/* #10 Accessible live region for screen readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isLoading && "Loading preview..."}
          {error && `Error: ${error}`}
          {result && `Preview loaded for ${result.meta.ogTitle || result.meta.title || result.url}`}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* #6 Loading skeleton */}
        {isLoading && <LoadingSkeleton />}

        {/* Results */}
        {result && (
          <div className="space-y-10 mb-12">
            {/* #4 Show final URL if redirected */}
            {result.finalUrl && (
              <div className="text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Redirected to:{" "}
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">
                    {result.finalUrl}
                  </span>
                </p>
              </div>
            )}

            {/* Preview Cards */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6 text-center">
                Platform Previews
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TwitterCard meta={result.meta} url={result.url} />
                <SlackCard meta={result.meta} url={result.url} />
                <LinkedInCard meta={result.meta} url={result.url} />
              </div>
            </div>

            {/* Health Score + Copy HTML */}
            <div>
              <HealthScore meta={result.meta} />

              {/* #8 Copy all meta tags as HTML */}
              <div className="w-full max-w-2xl mx-auto mt-4">
                <button
                  onClick={handleCopyMetaHtml}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-150"
                >
                  {copiedHtml ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy all tags as HTML
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="mt-8">
          <History
            entries={history}
            onSelect={handleHistorySelect}
            onClear={handleClearHistory}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-neutral-400">
            Link Preview Studio &mdash; Built by Matthew McManness
          </p>
        </div>
      </footer>
    </div>
  );
}
