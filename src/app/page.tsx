"use client";

import { useState, useEffect, useCallback } from "react";
import type { FetchResult, HistoryEntry } from "./types";
import UrlInput from "./components/UrlInput";
import TwitterCard from "./components/TwitterCard";
import SlackCard from "./components/SlackCard";
import LinkedInCard from "./components/LinkedInCard";
import HealthScore from "./components/HealthScore";
import History from "./components/History";
import DarkModeToggle from "./components/DarkModeToggle";
import ErrorMessage from "./components/ErrorMessage";

const HISTORY_KEY = "lps-history";
const MAX_HISTORY = 10;

export default function Home() {
  const [inputUrl, setInputUrl] = useState("");
  const [result, setResult] = useState<FetchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

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
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/fetch-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An unexpected error occurred.");
        return;
      }

      setResult(data);
      addToHistory({
        url: data.url,
        meta: data.meta,
        fetchedAt: data.fetchedAt,
      });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
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

        {/* Error */}
        {error && (
          <div className="mb-8">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-10 mb-12">
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

            {/* Health Score */}
            <HealthScore meta={result.meta} />
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
