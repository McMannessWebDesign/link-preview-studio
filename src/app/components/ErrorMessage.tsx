/**
 * ErrorMessage.tsx — Error Display Component (Client Component)
 *
 * Displays a styled error banner when a URL fetch fails. Shows:
 * - A red warning icon on the left.
 * - A generic "Something went wrong" heading.
 * - The specific error message from the API (e.g. "HTTP 404: Not Found" or
 *   "DNS lookup failed — the domain does not exist").
 * - An optional "Try again" button that retries the last failed request.
 *
 * The error messages are generated server-side in the API route (fetch-meta/route.ts),
 * which maps different failure types (HTTP errors, DNS failures, timeouts, SSL issues,
 * etc.) to user-friendly descriptions. This component just displays whatever message
 * the parent passes down.
 *
 * PROPS:
 * - message: The error text to display (from the API response's `error` field).
 * - onRetry: Optional callback for the "Try again" button. When provided, the button
 *   is shown. When omitted (undefined), the button is hidden.
 */
"use client";

interface ErrorMessageProps {
  message: string;       // The error message to display
  onRetry?: () => void;  // Optional: callback for the "Try again" button
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Error banner with red theme — icon left, text center, retry button right */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
        {/* Warning circle icon */}
        <svg
          className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {/* Error text */}
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            Something went wrong
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {message}
          </p>
        </div>
        {/* "Try again" button — only rendered when onRetry callback is provided */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-lg transition-colors duration-150"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
