/**
 * UrlInput.tsx — URL Input Form Component (Client Component)
 *
 * This is the main input form at the top of the page where users type or paste a URL.
 *
 * FEATURES:
 * - Auto-focuses the input on page load so the user can start typing immediately.
 * - Client-side URL validation: Shows a red border + hint if the text doesn't look
 *   like a URL (no dot, has spaces, etc.). This is a UX convenience only — the real
 *   validation happens server-side in the API route.
 * - Paste-and-go: When the input is empty and the user pastes a URL, it automatically
 *   submits without requiring them to click "Preview". Uses setTimeout(0) to defer
 *   the submit until after React processes the paste event and updates state.
 * - Loading state: While a fetch is in-flight, the input is disabled and the button
 *   shows a spinner with "Fetching" text.
 *
 * PROPS:
 * - url:         The current input value (controlled by parent).
 * - onUrlChange: Called when the user types (parent updates the `url` state).
 * - onSubmit:    Called when the form is submitted (Enter key or button click).
 * - isLoading:   Whether a fetch is currently in progress (disables the form).
 */
"use client";

import { useRef, useEffect } from "react";

/** TypeScript interface defining the props this component accepts. */
interface UrlInputProps {
  url: string;                      // Current value in the input field
  onUrlChange: (url: string) => void; // Callback when text changes
  onSubmit: (url: string) => void;    // Callback when form is submitted
  isLoading: boolean;                 // Whether a fetch is in progress
}

/**
 * looksLikeUrl: Simple client-side heuristic to check if the input looks like a URL.
 * This is NOT strict URL validation — it's just a UX hint to catch obvious non-URLs
 * (like typing random words). The server does the real validation.
 *
 * Returns true if:
 * - The input is empty (we don't show an error for an empty field).
 * - It starts with http:// or https:// followed by something.
 * - It contains a dot with no spaces (looks like "example.com" or "foo.bar/path").
 */
function looksLikeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true; // Empty is fine — no error shown
  if (/^https?:\/\/.+/i.test(trimmed)) return true; // Has protocol
  if (/^[^\s]+\.[^\s]+/.test(trimmed)) return true;  // Has a dot, no spaces (domain-like)
  return false;
}

export default function UrlInput({ url, onUrlChange, onSubmit, isLoading }: UrlInputProps) {
  /** Ref to the <input> element so we can programmatically focus it on mount. */
  const inputRef = useRef<HTMLInputElement>(null);

  /** Run the client-side URL validation on every keystroke. */
  const isValid = looksLikeUrl(url);

  /** Auto-focus the input when the component first mounts (page load). */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * handleSubmit: Called when the <form> is submitted (Enter key or button click).
   * Prevents the default browser form submission (which would reload the page),
   * then calls the parent's onSubmit if the input is non-empty and passes validation.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && isValid) {
      onSubmit(url.trim());
    }
  };

  /**
   * handlePaste: "Paste-and-go" feature.
   * When the user pastes text into an EMPTY input field, this automatically:
   * 1. Updates the input value to the pasted text.
   * 2. Immediately submits it (no need to click "Preview").
   *
   * The setTimeout(0) is needed because React's synthetic paste event fires BEFORE
   * the input value is updated. By deferring to the next microtask, we ensure the
   * state update and submission happen after React has processed the paste.
   *
   * Only triggers when: the field is empty, not already loading, and pasted text exists.
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (pasted && !isLoading && !url.trim()) {
      setTimeout(() => {
        onUrlChange(pasted);
        onSubmit(pasted);
      }, 0);
    }
  };

  /*
   * RENDER:
   * A <form> with a text input and submit button side by side.
   * - The input has a decorative link icon on the left (absolute positioned, pointer-events-none).
   * - A validation error message appears below the input when the text doesn't look like a URL.
   * - The submit button shows a spinner during loading, or a search icon when idle.
   * - Both the input and button are disabled during loading to prevent double-submits.
   */
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        {/* Input container — "relative" to position the link icon and validation hint */}
        <div className="relative flex-1">
          {/* Decorative link icon inside the input (left side) */}
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
