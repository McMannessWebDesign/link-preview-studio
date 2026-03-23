export interface MetaTags {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
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
  finalUrl?: string; // #4 Final URL after redirects
  meta: MetaTags;
  fetchedAt: string;
}

export interface HistoryEntry {
  url: string;
  meta: MetaTags;
  fetchedAt: string;
}

export interface HealthScore {
  score: number;
  present: string[];
  missing: string[];
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
