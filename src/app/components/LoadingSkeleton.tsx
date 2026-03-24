/**
 * LoadingSkeleton.tsx — Loading Placeholder Component (Client Component)
 *
 * Displayed while the API is fetching and parsing a URL's meta tags. Shows a "skeleton"
 * layout that matches the shape of the actual result UI, so the user gets a visual hint
 * of what's coming and the page doesn't jump when the real content loads.
 *
 * SKELETON STRUCTURE (matches the result layout in page.tsx):
 * 1. "Platform Previews" section heading placeholder.
 * 2. Three-column grid of card placeholders:
 *    - Twitter card skeleton: Wide image area (2:1 ratio) + domain text.
 *    - Slack card skeleton: Left border bar + site name + title + description lines + image.
 *    - LinkedIn card skeleton: Horizontal layout with square thumbnail + text lines.
 * 3. "Meta Tag Health" section with:
 *    - Score circle placeholder (20x20 rounded-full).
 *    - Summary text placeholder.
 *
 * ANIMATION:
 * The outer div has `animate-pulse` which applies a Tailwind CSS pulsing opacity
 * animation to all children. The gray rectangles fade in and out to indicate loading.
 *
 * WHY SKELETON INSTEAD OF A SPINNER?
 * Skeleton loading gives users a better sense of what content is coming and reduces
 * perceived wait time. It also prevents layout shift (CLS) because the skeleton
 * occupies the same space as the real content.
 */
"use client";

export default function LoadingSkeleton() {
  return (
    /* animate-pulse: Tailwind's built-in CSS animation that fades opacity between 100% and 50% */
    <div className="space-y-10 mb-12 animate-pulse">
      {/* === Platform Preview Cards Section === */}
      <div>
        {/* "Platform Previews" heading placeholder */}
        <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-700 rounded mx-auto mb-6" />
        {/* Three-column grid matching the real card layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Twitter card skeleton — wide image + domain text */}
          <div>
            <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div className="aspect-[504/252] bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mt-2 ml-1" />
            </div>
          </div>
          {/* Slack card skeleton — left border + text lines + image block */}
          <div>
            <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
            <div className="border-l-4 border-neutral-200 dark:border-neutral-700 pl-3">
              <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
              <div className="h-5 w-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
              <div className="space-y-1.5">
                <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded" />
                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
              </div>
              <div className="mt-2 w-full h-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          </div>
          {/* LinkedIn card skeleton — horizontal: thumbnail left + text right */}
          <div>
            <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 flex overflow-hidden">
              <div className="w-[128px] h-[80px] bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
              <div className="p-3 flex-1 space-y-2">
                <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded" />
                <div className="h-3 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
                <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* === Health Score Section Skeleton === */}
      <div>
        {/* "Meta Tag Health" heading placeholder */}
        <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-700 rounded mb-4" />
        <div className="flex items-center gap-6 mb-6">
          {/* Score ring placeholder (circular) */}
          <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          {/* "X of Y tags present" text placeholder */}
          <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
    </div>
  );
}
