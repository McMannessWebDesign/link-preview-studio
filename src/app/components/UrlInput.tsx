"use client";

import { useRef, useEffect } from "react";

interface UrlInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

// #5 Simple client-side URL validation
function looksLikeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true; // Empty is fine
  // Has protocol
  if (/^https?:\/\/.+/i.test(trimmed)) return true;
  // Looks like a domain (has a dot, no spaces)
  if (/^[^\s]+\.[^\s]+/.test(trimmed)) return true;
  return false;
}

export default function UrlInput({ url, onUrlChange, onSubmit, isLoading }: UrlInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isValid = looksLikeUrl(url);

  // #1 Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && isValid) {
      onSubmit(url.trim());
    }
  };

  // #8 Paste-and-go: auto-submit when a URL is pasted into an empty field
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (pasted && !isLoading && !url.trim()) {
      setTimeout(() => {
        onUrlChange(pasted);
        onSubmit(pasted);
      }, 0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg
              className="w-5 h-5 text-neutral-400"
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
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onPaste={handlePaste}
            placeholder="Paste any URL... e.g. https://github.com"
            aria-label="URL to preview"
            aria-invalid={!isValid}
            className={`w-full pl-12 pr-4 py-3.5 bg-white dark:bg-neutral-800 border rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
              !isValid
                ? "border-red-400 dark:border-red-500 focus:ring-red-400"
                : "border-neutral-200 dark:border-neutral-700 focus:ring-indigo-500"
            }`}
            disabled={isLoading}
          />
          {/* #5 Client-side validation hint */}
          {!isValid && (
            <p className="absolute -bottom-5 left-0 text-xs text-red-500">
              This doesn&apos;t look like a valid URL
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !url.trim() || !isValid}
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Fetching
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Preview
            </>
          )}
        </button>
      </div>
    </form>
  );
}
