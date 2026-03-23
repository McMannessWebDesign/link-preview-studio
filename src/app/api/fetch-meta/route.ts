import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { MetaTags } from "../../types";

const TIMEOUT_MS = 10000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5MB cap
const MAX_META_LENGTH = 500; // Truncate excessively long meta values

// #9 In-memory rate limiting with cleanup (per IP, 20 requests per minute)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_CLEANUP_INTERVAL = 5 * 60_000; // Clean stale entries every 5 min
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // #2 Periodic cleanup of expired entries to prevent memory leak
  if (now - lastCleanup > RATE_LIMIT_CLEANUP_INTERVAL) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
    lastCleanup = now;
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// #1 SSRF Protection — block private/internal network addresses
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "0.0.0.0",
  "metadata.google.internal",
]);

function isPrivateIP(hostname: string): boolean {
  // Block reserved hostnames
  if (BLOCKED_HOSTNAMES.has(hostname.toLowerCase())) return true;

  // IPv4 patterns for private/reserved ranges
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 127) return true;                    // 127.0.0.0/8 loopback
    if (a === 10) return true;                     // 10.0.0.0/8 private
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
    if (a === 192 && b === 168) return true;       // 192.168.0.0/16 private
    if (a === 169 && b === 254) return true;       // 169.254.0.0/16 link-local (AWS metadata)
    if (a === 0) return true;                      // 0.0.0.0/8
  }

  // IPv6 loopback
  if (hostname === "::1" || hostname === "[::1]") return true;

  return false;
}

// #2 Protocol restriction — only allow http and https
function isAllowedProtocol(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// #6 Truncate excessively long meta content
function truncateMeta(value: string): string {
  if (value.length <= MAX_META_LENGTH) return value;
  return value.slice(0, MAX_META_LENGTH) + "…";
}

function resolveUrl(base: string, path: string): string {
  if (!path) return "";
  try {
    return new URL(path, base).href;
  } catch {
    return path;
  }
}

// #3 Read response body with size limit
async function readBodyWithLimit(response: Response, limit: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    return await response.text();
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > limit) {
      reader.cancel();
      throw new Error("RESPONSE_TOO_LARGE");
    }
    chunks.push(value);
  }

  const decoder = new TextDecoder("utf-8", { fatal: false });
  return chunks.map((chunk) => decoder.decode(chunk, { stream: true })).join("") +
    decoder.decode();
}

export async function POST(request: NextRequest) {
  // #9 Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded — please wait a minute before trying again." },
      { status: 429 }
    );
  }

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
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // #2 Protocol restriction
  if (!isAllowedProtocol(url)) {
    return NextResponse.json(
      { error: "Only http:// and https:// URLs are supported." },
      { status: 400 }
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json(
      { error: "Invalid URL format." },
      { status: 400 }
    );
  }

  // #1 SSRF Protection
  if (isPrivateIP(parsed.hostname)) {
    return NextResponse.json(
      { error: "URLs pointing to private or internal network addresses are not allowed." },
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
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    // #5 Check final URL after redirects for SSRF (redirect could land on internal IP)
    const finalUrl = response.url || url;
    try {
      const finalParsed = new URL(finalUrl);
      if (isPrivateIP(finalParsed.hostname)) {
        return NextResponse.json(
          { error: "The URL redirected to a private or internal network address." },
          { status: 400 }
        );
      }
    } catch {
      // If we can't parse the final URL, continue with the original
    }

    if (!response.ok) {
      const statusMessages: Record<number, string> = {
        400: "Bad Request — the server did not understand the request.",
        401: "Unauthorized — this page requires authentication.",
        403: "Forbidden — the server refused the request. The site may be blocking automated access.",
        404: "Not Found — no page exists at this URL.",
        405: "Method Not Allowed — the server rejected the request method.",
        410: "Gone — this page has been permanently removed.",
        429: "Too Many Requests — the server is rate-limiting requests. Try again later.",
        500: "Internal Server Error — something went wrong on the target server.",
        502: "Bad Gateway — the server received an invalid response from an upstream server.",
        503: "Service Unavailable — the target server is temporarily down or overloaded.",
        504: "Gateway Timeout — the target server took too long to respond.",
      };
      const msg = statusMessages[response.status] || `The server returned HTTP ${response.status}.`;
      return NextResponse.json(
        { error: `HTTP ${response.status}: ${msg}` },
        { status: 422 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      // #5 Better message for redirect-to-non-HTML
      const contentDesc =
        contentType.includes("pdf") ? "a PDF document" :
        contentType.includes("image") ? "an image" :
        contentType.includes("json") ? "a JSON response" :
        contentType.includes("xml") ? "an XML document" :
        contentType.includes("text/plain") ? "a plain text file" :
        `a non-HTML response (${contentType.split(";")[0].trim()})`;
      return NextResponse.json(
        { error: `This URL returned ${contentDesc} instead of an HTML page.` },
        { status: 422 }
      );
    }

    // #3 Read body with size limit
    let html: string;
    try {
      html = await readBodyWithLimit(response, MAX_RESPONSE_BYTES);
    } catch (err) {
      if (err instanceof Error && err.message === "RESPONSE_TOO_LARGE") {
        return NextResponse.json(
          { error: "The page is too large to process (exceeds 5MB). Try a different URL." },
          { status: 422 }
        );
      }
      throw err;
    }

    const $ = cheerio.load(html);

    const getMeta = (attr: string, value: string): string => {
      const content = $(`meta[${attr}="${value}"]`).attr("content") || "";
      return truncateMeta(content); // #6 Truncate long values
    };

    const ogImage = getMeta("property", "og:image");
    const twitterImage = getMeta("name", "twitter:image") || getMeta("property", "twitter:image");

    // #2 Favicon: check link tags first, fall back to /favicon.ico
    const faviconEl =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      "/favicon.ico"; // Most sites serve this by convention

    const meta: MetaTags = {
      title: truncateMeta($("title").first().text().trim()), // #6
      description: getMeta("name", "description"),
      ogTitle: getMeta("property", "og:title"),
      ogDescription: getMeta("property", "og:description"),
      ogImage: ogImage ? resolveUrl(url, ogImage) : "",
      ogImageWidth: getMeta("property", "og:image:width"),
      ogImageHeight: getMeta("property", "og:image:height"),
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
      finalUrl: finalUrl !== url ? finalUrl : undefined,
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

    // Generic "fetch failed"
    if (message === "fetch failed") {
      return NextResponse.json(
        { error: "Could not reach this URL — the site may be down, blocking automated requests, or the domain may not exist." },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: message || "An unexpected error occurred while fetching the URL." },
      { status: 500 }
    );
  }
}
