/**
 * page.tsx — Main Page (Client Component)
 *
 * This is the single-page application entry point for Link Preview Studio.
 * It is marked "use client" because it uses React hooks (useState, useEffect, etc.)
 * and browser APIs (localStorage, window.history, navigator.clipboard).
 *
 * HIGH-LEVEL FLOW:
 * 1. User pastes a URL into the <UrlInput> form.
 * 2. handleSubmit() sends a POST request to our own backend API route at "/api/fetch-meta".
 *    - The backend (not the browser) fetches the target URL, parses its HTML with cheerio,
 *      and returns the extracted Open Graph / Twitter / general meta tags as JSON.
 * 3. The returned meta tag data is stored in `result` state and rendered as:
 *    - Platform preview cards (Twitter, Slack, LinkedIn) showing how the link will look.
 *    - A "Health Score" panel grading how complete the meta tags are.
 * 4. Each successful fetch is saved to localStorage as a history entry so users can
 *    revisit previous checks without re-fetching.
 *
 * STATE MANAGEMENT:
 * - inputUrl:        The current text in the URL input field (controlled input).
 * - result:          The successful API response (meta tags + URL info), or null.
 * - error:           An error message string if the fetch failed, or null.
 * - isLoading:       True while waiting for the API response (shows skeleton loader).
 * - history:         Array of past successful fetches, persisted in localStorage.
 * - copiedHtml:      Briefly true after "Copy all tags as HTML" is clicked (feedback).
 * - lastSubmittedUrl: Remembers the last URL that was submitted so "Try again" can retry.
 * - requestIdRef:    A mutable ref counter that increments on each submit. If the user
 *                    submits a new URL before the previous fetch completes, only the
 *                    latest request's response is used (stale responses are discarded).
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { FetchResult, HistoryEntry } from "./types";
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

/** localStorage key where the recent-checks history array is stored. */
const HISTORY_KEY = "lps-history";

/** Maximum number of history entries to keep (oldest are trimmed when this is exceeded). */
const MAX_HISTORY = 10;

export default function Home() {
  const [inputUrl, setInputUrl] = useState("");          // Current value in the URL text field
  const [result, setResult] = useState<FetchResult | null>(null); // Successful API response data
  const [error, setError] = useState<string | null>(null);        // Error message from a failed fetch
  const [isLoading, setIsLoading] = useState(false);              // Whether a fetch is in-flight
  const [history, setHistory] = useState<HistoryEntry[]>([]);     // Recent checks list (persisted)
  const [copiedHtml, setCopiedHtml] = useState(false);            // Flash "Copied!" after HTML copy
  const [lastSubmittedUrl, setLastSubmittedUrl] = useState("");   // For the "Try again" retry button

  /**
   * requestIdRef is a counter used to prevent stale responses from overwriting newer ones.
   * Each call to handleSubmit increments this. When the fetch resolves, if the ref has
   * moved past the ID that was captured at the start of that call, we know a newer request
   * was initiated and we silently discard the stale response.
   */
  const requestIdRef = useRef(0);

  /**
   * ON MOUNT: Load any previously saved history from localStorage.
   * This runs once (empty dependency array) when the component first renders.
   * If localStorage is unavailable (e.g. private browsing) or the data is corrupt,
   * we silently catch the error and start with an empty history.
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // localStorage unavailable or corrupt — start with empty history
    }
  }, []);

  /**
   * ON MOUNT: Shareable URL support via query parameter.
   * If the page was loaded with "?url=https://example.com" in the address bar,
   * we populate the input field and immediately trigger a fetch. This lets users
   * share a direct link to a specific preview (e.g. bookmark or send to a colleague).
   *
   * The eslint-disable is needed because handleSubmit is intentionally omitted from
   * the dependency array — we only want this to run once on mount, not re-run if
   * handleSubmit's identity changes.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("url");
    if (urlParam) {
      setInputUrl(urlParam);
      handleSubmit(urlParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Dynamic tab title: When a result is displayed, the browser tab shows the
   * page's og:title (or <title>, or domain) so users with multiple tabs can
   * tell which preview they're looking at. Resets to the default when there's
   * no result (e.g. after navigating away or clearing).
   */
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

  /**
   * saveHistory: Overwrites the entire history array (used by "Clear history").
   * Wrapped in useCallback so it has a stable identity and doesn't cause
   * unnecessary re-renders when passed as a prop.
   */
  const saveHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
    } catch {
      // localStorage full or unavailable — history just won't persist
    }
  }, []);

  /**
   * addToHistory: Prepends a new entry to the history list.
   * - Uses a functional state update `setHistory((prev) => ...)` to avoid a stale
   *   closure problem: without this, `history` at call time could be outdated if
   *   multiple fetches complete in quick succession.
   * - Deduplicates by URL (removes any existing entry with the same URL before prepending).
   * - Trims to MAX_HISTORY entries so localStorage doesn't grow unbounded.
   */
  const addToHistory = useCallback(
    (entry: HistoryEntry) => {
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.url !== entry.url); // Remove duplicate if present
        const updated = [entry, ...filtered].slice(0, MAX_HISTORY); // Prepend and trim
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        } catch {
          // localStorage full — history update is lost but app continues
        }
        return updated;
      });
    },
    []
  );

  /**
   * handleSubmit: The core function — called when the user clicks "Preview" or pastes a URL.
   *
   * FLOW:
   * 1. Increment the request ID counter so we can detect stale responses.
   * 2. Reset the UI to "loading" state (clear previous result/error, show skeleton).
   * 3. Update the browser address bar to include "?url=..." for shareability.
   *    Uses replaceState (not pushState) so it doesn't create extra back-button entries.
   * 4. POST the URL to our server-side API route "/api/fetch-meta".
   *    - The SERVER fetches the target page (avoiding CORS issues).
   *    - The server parses the HTML with cheerio and extracts meta tags.
   *    - Returns JSON with the meta tags, the original URL, and the final URL after redirects.
   * 5. If the response comes back and a newer request has been initiated since then
   *    (thisRequestId !== requestIdRef.current), we discard this response silently.
   * 6. On success: store the result, update the input to show the normalized URL,
   *    and add the entry to history.
   * 7. On failure: display the error message from the API (or a generic network error).
   * 8. Finally: only clear the loading state if this is still the active request.
   */
  const handleSubmit = async (url: string) => {
    const thisRequestId = ++requestIdRef.current; // Capture this request's ID

    // Reset UI to loading state
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLastSubmittedUrl(url);

    // Update the browser's address bar so this preview is shareable as a direct link.
    // replaceState avoids polluting the browser's back-button history.
    const newUrl = `${window.location.pathname}?url=${encodeURIComponent(url)}`;
    window.history.replaceState({}, "", newUrl);

    try {
      // Send the URL to our own backend API route for server-side fetching.
      // The browser never contacts the target URL directly.
      const response = await fetch("/api/fetch-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      // STALE CHECK: If user submitted another URL while this was in-flight, discard.
      if (thisRequestId !== requestIdRef.current) return;

      const data = await response.json();

      // The API returns error details in the JSON body with a non-200 status.
      if (!response.ok) {
        setError(data.error || "An unexpected error occurred.");
        return;
      }

      // SUCCESS: Store the result and update the input field to the normalized URL
      // (e.g. the API may have prepended "https://" if it was missing).
      setResult(data);
      setInputUrl(data.url);

      // Save to history for quick re-access later.
      addToHistory({
        url: data.url,
        meta: data.meta,
        fetchedAt: data.fetchedAt,
      });
    } catch {
      // Network-level failure (no internet, DNS failure on our own API, etc.)
      if (thisRequestId !== requestIdRef.current) return;
      setError("Network error. Please check your connection and try again.");
    } finally {
      // Only clear loading if this is still the active request.
      // If a newer request superseded this one, that newer request owns the loading state.
      if (thisRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  /**
   * handleRetry: Called when the user clicks "Try again" on an error message.
   * Re-submits the last URL that was attempted (even though it failed).
   */
  const handleRetry = () => {
    if (lastSubmittedUrl) {
      handleSubmit(lastSubmittedUrl);
    }
  };

  /**
   * handleRefresh: Called when the user clicks the "Re-fetch" button on a successful result.
   * Re-fetches the same URL to get updated meta tags (useful if the user just changed their
   * site's meta tags and wants to verify the change).
   */
  const handleRefresh = () => {
    if (result) {
      handleSubmit(result.url);
    }
  };

  /**
   * handleExampleSelect: Called when a first-time user clicks one of the example URL buttons
   * (e.g. "GitHub", "Stripe"). Fills the input and immediately triggers a fetch.
   */
  const handleExampleSelect = (url: string) => {
    setInputUrl(url);
    handleSubmit(url);
  };

  /**
   * handleHistorySelect: Called when the user clicks a history entry.
   * Instead of re-fetching (which costs time and an API call), this restores the cached
   * result directly from the history data. It also updates the URL bar so the link is
   * shareable, and scrolls to the top so the user sees the preview cards immediately.
   */
  const handleHistorySelect = (entry: HistoryEntry) => {
    setResult({
      url: entry.url,
      meta: entry.meta,
      fetchedAt: entry.fetchedAt,
    });
    setInputUrl(entry.url);
    setError(null);
    // Update URL bar to match the selected history entry
    const newUrl = `${window.location.pathname}?url=${encodeURIComponent(entry.url)}`;
    window.history.replaceState({}, "", newUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** handleClearHistory: Wipes all history entries from state and localStorage. */
  const handleClearHistory = () => {
    saveHistory([]);
  };

  /**
   * handleCopyMetaHtml: Builds a ready-to-paste HTML snippet containing all the detected
   * meta tags and copies it to the clipboard. This is useful for developers who want to
   * see exactly what tags a site has, or quickly copy a template of well-formed meta tags.
   *
   * Only includes tags that actually have values (skips empty/missing ones).
   * Shows a brief "Copied!" confirmation that auto-clears after 2 seconds.
   */
  const handleCopyMetaHtml = async () => {
    if (!result) return;
    const m = result.meta;
    const lines: string[] = [];
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
      setTimeout(() => setCopiedHtml(false), 2000); // Auto-clear the "Copied!" feedback
    } catch {
      // Clipboard API not available (e.g. non-HTTPS or denied permission)
    }
  };

  /**
   * showExamples: Only show the example URL buttons when the user has never used the app
   * before (no history) and nothing else is on screen (no result, no error, not loading).
   * Once they've used it at least once, history takes the place of examples.
   */
  const showExamples = !result && !error && !isLoading && history.length === 0;

  /*
   * RENDER LAYOUT:
   * - Header: App logo + dark mode toggle
   * - Main content:
   *   - Hero text explaining what the tool does
   *   - <UrlInput>: The URL input form with paste-and-go support
   *   - <ExampleUrls>: Clickable example URLs (shown only for first-time users)
   *   - aria-live region: Announces loading/error/success state to screen readers
   *   - <ErrorMessage>: Displayed when a fetch fails, with a "Try again" button
   *   - <LoadingSkeleton>: Animated placeholder matching the shape of the result cards
   *   - Result section (when data is available):
   *     - Redirect notice (if the URL was redirected)
   *     - Re-fetch button
   *     - Preview cards grid: <TwitterCard>, <SlackCard>, <LinkedInCard>
   *     - <HealthScore>: Tag completeness score + tag-by-tag breakdown
   *     - "Copy all tags as HTML" button
   *   - <History>: List of recent successful checks
   * - Footer: Attribution
   */
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — app branding (left) + dark mode toggle (right) */}
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

        {/* Example URLs for first-time users */}
        {showExamples && (
          <div className="mb-8">
            <ExampleUrls onSelect={handleExampleSelect} />
          </div>
        )}

        {/*
          Accessible live region: This invisible <div> uses aria-live="polite"
          so screen readers announce state changes (loading, error, success)
          without the user needing to navigate to them manually.
          aria-atomic="true" means the entire content is announced on each change.
        */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isLoading && "Loading preview..."}
          {error && `Error: ${error}`}
          {result && `Preview loaded for ${result.meta.ogTitle || result.meta.title || result.url}`}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8">
            <ErrorMessage message={error} onRetry={handleRetry} />
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && <LoadingSkeleton />}

        {/* Results */}
        {result && (
          <div className="space-y-10 mb-12 results-enter">
            {/* Redirect notice + re-fetch button */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {result.finalUrl && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Redirected to:{" "}
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">
                    {result.finalUrl}
                  </span>
                </p>
              )}
              {/* #9 Re-fetch button */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-150 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-fetch
              </button>
            </div>

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
