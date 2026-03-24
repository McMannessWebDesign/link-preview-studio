/**
 * ExampleUrls.tsx — Example URL Buttons (Client Component)
 *
 * Shown to first-time users when there's no history and no active result.
 * Provides clickable buttons for well-known websites so users can immediately
 * see what the tool does without needing to find a URL to test.
 *
 * These sites were chosen because:
 * - They have well-configured meta tags (good examples of "healthy" previews).
 * - They're recognizable and trustworthy (users won't hesitate to click).
 * - They represent different industries/types of content.
 *
 * PROPS:
 * - onSelect: Called with the URL string when a button is clicked. The parent (page.tsx)
 *   fills the input field with this URL and immediately triggers a fetch.
 *
 * VISIBILITY:
 * This component is only rendered when `showExamples` is true in page.tsx, which requires:
 * - No result displayed, no error, not loading, AND no history entries.
 * Once the user has any history, this section is replaced by the History component.
 */
"use client";

/** Predefined example URLs with display labels. */
const EXAMPLES = [
  { url: "https://github.com", label: "GitHub" },
  { url: "https://www.nytimes.com", label: "NY Times" },
  { url: "https://stripe.com", label: "Stripe" },
  { url: "https://open.spotify.com", label: "Spotify" },
];

interface ExampleUrlsProps {
  onSelect: (url: string) => void; // Callback when an example button is clicked
}

export default function ExampleUrls({ onSelect }: ExampleUrlsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-2">
        Try an example:
      </p>
      {/* Horizontally centered row of pill-shaped buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.url}
            onClick={() => onSelect(ex.url)}
            className="px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 rounded-lg transition-colors duration-150"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}
