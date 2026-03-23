import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { MetaTags } from "../../types";

const TIMEOUT_MS = 10000;

function resolveUrl(base: string, path: string): string {
  if (!path) return "";
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}

export async function POST(request: NextRequest) {
  let url: string;

  try {
    const body = await request.json();
    url = body.url?.trim();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!url) {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }

  // Prepend https:// if no protocol
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json(
      { error: "Invalid URL format." },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LinkPreviewStudio/1.0; +https://github.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: HTTP ${response.status}` },
        { status: 422 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "URL did not return an HTML page." },
        { status: 422 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const getMeta = (attr: string, value: string): string => {
      return (
        $(`meta[${attr}="${value}"]`).attr("content") || ""
      );
    };

    const ogImage = getMeta("property", "og:image");
    const twitterImage = getMeta("name", "twitter:image") || getMeta("property", "twitter:image");

    const faviconEl =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      "";

    const meta: MetaTags = {
      title: $("title").first().text().trim(),
      description: getMeta("name", "description"),
      ogTitle: getMeta("property", "og:title"),
      ogDescription: getMeta("property", "og:description"),
      ogImage: ogImage ? resolveUrl(url, ogImage) : "",
      ogUrl: getMeta("property", "og:url"),
      twitterCard: getMeta("name", "twitter:card") || getMeta("property", "twitter:card"),
      twitterTitle: getMeta("name", "twitter:title") || getMeta("property", "twitter:title"),
      twitterDescription: getMeta("name", "twitter:description") || getMeta("property", "twitter:description"),
      twitterImage: twitterImage ? resolveUrl(url, twitterImage) : "",
      favicon: faviconEl ? resolveUrl(url, faviconEl) : "",
      siteName: getMeta("property", "og:site_name"),
      themeColor: getMeta("name", "theme-color"),
    };

    return NextResponse.json({
      url,
      meta,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out — the URL took longer than 10 seconds to respond." },
        { status: 408 }
      );
    }

    const message = err instanceof Error ? err.message : "";
    const cause = err instanceof Error && err.cause ? String(err.cause) : "";

    // DNS resolution failure
    if (cause.includes("ENOTFOUND") || message.includes("ENOTFOUND")) {
      const hostname = (() => { try { return new URL(url).hostname; } catch { return url; } })();
      return NextResponse.json(
        { error: `DNS lookup failed — the domain "${hostname}" does not exist or could not be resolved.` },
        { status: 422 }
      );
    }

    // Connection refused
    if (cause.includes("ECONNREFUSED") || message.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Connection refused — the server exists but is not accepting connections." },
        { status: 422 }
      );
    }

    // Connection reset
    if (cause.includes("ECONNRESET") || message.includes("ECONNRESET")) {
      return NextResponse.json(
        { error: "Connection reset — the server closed the connection unexpectedly." },
        { status: 422 }
      );
    }

    // SSL/TLS errors
    if (cause.includes("CERT") || cause.includes("SSL") || message.includes("CERT") || message.includes("SSL")) {
      return NextResponse.json(
        { error: "SSL certificate error — the site has an invalid or expired certificate." },
        { status: 422 }
      );
    }

    // Network unreachable
    if (cause.includes("ENETUNREACH") || message.includes("ENETUNREACH")) {
      return NextResponse.json(
        { error: "Network unreachable — could not establish a connection to the server." },
        { status: 422 }
      );
    }

    // Too many redirects
    if (message.includes("redirect") && message.includes("max")) {
      return NextResponse.json(
        { error: "Too many redirects — the URL redirected more times than allowed." },
        { status: 422 }
      );
    }

    // Generic "fetch failed" — provide a more helpful message
    if (message === "fetch failed") {
      return NextResponse.json(
        { error: `Could not reach this URL — the site may be down, blocking automated requests, or the domain may not exist.` },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: message || "An unexpected error occurred while fetching the URL." },
      { status: 500 }
    );
  }
}
