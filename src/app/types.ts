export interface MetaTags {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageWidth: string;
  ogImageHeight: string;
  ogUrl: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  favicon: string;
  siteName: string;
  themeColor: string;
}

export interface FetchResult {
  url: string;
  finalUrl?: string;
  meta: MetaTags;
  fetchedAt: string;
}

export interface HistoryEntry {
  url: string;
  meta: MetaTags;
  fetchedAt: string;
}

export const META_TAG_LABELS: Record<string, string> = {
  title: "Page <title>",
  description: '<meta name="description">',
  ogTitle: "og:title",
  ogDescription: "og:description",
  ogImage: "og:image",
  ogUrl: "og:url",
  twitterCard: "twitter:card",
  twitterTitle: "twitter:title",
  twitterDescription: "twitter:description",
  twitterImage: "twitter:image",
};

// #1 Character length recommendations per tag
export const TAG_CHAR_LIMITS: Record<string, { max: number; label: string }> = {
  title: { max: 60, label: "60 chars" },
  description: { max: 160, label: "160 chars" },
  ogTitle: { max: 60, label: "60 chars" },
  ogDescription: { max: 160, label: "160 chars" },
  twitterTitle: { max: 70, label: "70 chars" },
  twitterDescription: { max: 200, label: "200 chars" },
};

// #3 Recommendations for missing tags
export const TAG_RECOMMENDATIONS: Record<string, string> = {
  title: "Add a <title> tag. This is the most important tag for SEO and appears in browser tabs.",
  description: "Add a meta description. Search engines display this in results (aim for 150-160 chars).",
  ogTitle: "Add og:title for social sharing. Without it, platforms fall back to <title> which may not be optimized for social.",
  ogDescription: "Add og:description. This controls the description shown on Facebook, LinkedIn, and Slack previews.",
  ogImage: "Add og:image (recommended 1200x630px). Posts with images get significantly more engagement on social media.",
  ogUrl: "Add og:url to specify the canonical URL. This helps platforms resolve duplicate content.",
  twitterCard: 'Add twitter:card (set to "summary_large_image" for best visibility). Without it, X/Twitter may not show a preview.',
  twitterTitle: "Add twitter:title for X/Twitter. Without it, X falls back to og:title or <title>.",
  twitterDescription: "Add twitter:description for X/Twitter previews. Shown on summary cards.",
  twitterImage: "Add twitter:image for X/Twitter. Without it, X falls back to og:image.",
};
