/**
 * PreviewImage.tsx — Image with Loading & Error States (Client Component)
 *
 * A reusable image component used by TwitterCard, SlackCard, and LinkedInCard to display
 * og:image / twitter:image preview images.
 *
 * WHY NOT USE next/image?
 * The `src` URLs come from arbitrary external domains (whatever og:image the target page
 * specifies). next/image requires either:
 * - Pre-configured domains in next.config.js (impossible — we can't predict every site), or
 * - Using the `unoptimized` prop (which defeats the purpose).
 * So we use a plain <img> tag with our own loading UX instead.
 *
 * LOADING STATES:
 * 1. LOADING (initial): Shows an animated gray shimmer (pulse animation) as a placeholder.
 *    The actual <img> is rendered but with opacity-0, so it starts loading immediately
 *    but isn't visible until it finishes.
 * 2. LOADED: The shimmer disappears and the image fades in (opacity transition over 300ms).
 * 3. ERROR: If the image fails to load (404, CORS block, etc.), the entire component
 *    returns null — it simply disappears rather than showing a broken image icon.
 *    The parent card handles the layout gracefully when the image is absent.
 *
 * PROPS:
 * - src:       The image URL (from og:image, twitter:image, etc.).
 * - alt:       Alt text for accessibility (defaults to empty string for decorative images).
 * - className: Additional CSS classes passed through to the wrapper div.
 */
"use client";

import { useState } from "react";

interface PreviewImageProps {
  src: string;        // Image URL to display
  alt?: string;       // Alt text (empty = decorative image)
  className?: string; // Additional CSS classes for the wrapper
}

export default function PreviewImage({ src, alt = "", className = "" }: PreviewImageProps) {
  const [loaded, setLoaded] = useState(false);   // Becomes true when the image finishes loading
  const [error, setError] = useState(false);     // Becomes true if the image fails to load

  // If the image failed, render nothing (the parent handles missing images gracefully)
  if (error) return null;

  return (
    <div className={`relative ${className}`}>
      {/*
        Shimmer placeholder: A pulsing gray rectangle shown while the image loads.
        Positioned absolutely to fill the same space the image will occupy.
        Disappears once `loaded` becomes true.
      */}
      {!loaded && (
        <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      )}
      {/*
        The actual image: Starts invisible (opacity-0) and fades in when loaded.
        object-cover ensures it fills its container without distortion (crops if needed).
        eslint-disable is required because next/image can't handle arbitrary external URLs.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}    // Image loaded successfully — fade it in
        onError={() => setError(true)}    // Image failed — remove the entire component
      />
    </div>
  );
}
