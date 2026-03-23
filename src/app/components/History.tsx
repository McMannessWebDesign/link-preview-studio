"use client";

import type { HistoryEntry } from "../types";

interface HistoryProps {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export default function History({ entries, onSelect, onClear }: HistoryProps) {
  if (entries.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Recent Checks
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150"
        >
          Clear history
        </button>
      </div>
      <div className="space-y-1.5">
        {entries.map((entry, i) => {
          const domain = (() => {
            try {
              return new URL(entry.url).hostname;
            } catch {
              return entry.url;
            }
          })();
          const title =
            entry.meta.ogTitle || entry.meta.title || domain;
          const time = new Date(entry.fetchedAt).toLocaleString();

          return (
            <button
              key={`${entry.url}-${i}`}
              onClick={() => onSelect(entry)}
              className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150 text-left group"
            >
              {entry.meta.favicon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.meta.favicon}
                  alt=""
                  className="w-5 h-5 rounded flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-5 h-5 rounded bg-neutral-200 dark:bg-neutral-700 flex-shrink-0 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-neutral-400"
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
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {title}
                </p>
                <p className="text-xs text-neutral-400 truncate">{domain}</p>
              </div>
              <span className="text-xs text-neutral-400 flex-shrink-0 hidden sm:block">
                {time}
              </span>
              <svg
                className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 flex-shrink-0 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
