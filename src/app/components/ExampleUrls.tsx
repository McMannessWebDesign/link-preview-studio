"use client";

const EXAMPLES = [
  { url: "https://github.com", label: "GitHub" },
  { url: "https://www.nytimes.com", label: "NY Times" },
  { url: "https://stripe.com", label: "Stripe" },
  { url: "https://open.spotify.com", label: "Spotify" },
];

interface ExampleUrlsProps {
  onSelect: (url: string) => void;
}

export default function ExampleUrls({ onSelect }: ExampleUrlsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-2">
        Try an example:
      </p>
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
