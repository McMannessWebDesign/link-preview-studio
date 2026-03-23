"use client";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-10 mb-12 animate-pulse">
      <div>
        <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-700 rounded mx-auto mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Twitter skeleton */}
          <div>
            <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div className="aspect-[504/252] bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mt-2 ml-1" />
            </div>
          </div>
          {/* Slack skeleton */}
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
          {/* LinkedIn skeleton */}
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
      {/* Health score skeleton */}
      <div>
        <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-700 rounded mb-4" />
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
    </div>
  );
}
