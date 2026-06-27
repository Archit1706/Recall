/**
 * Minimal OpenGraph / metadata fetcher. No third-party deps; we run a 5-second
 * fetch, parse a small slice with regex, and return title + description + image.
 * This is good enough for the inline capture preview.
 */
export type LinkPreview = {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
};

const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (compatible; RecallBot/1.0; +https://github.com/Archit1706/recall)",
  accept: "text/html,application/xhtml+xml",
};

export async function fetchOg(rawUrl: string): Promise<LinkPreview> {
  const url = normalizeUrl(rawUrl);
  const fallback: LinkPreview = {
    url,
    title: null,
    description: null,
    image: null,
    siteName: hostnameOf(url),
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      headers: HEADERS,
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return fallback;
    const html = (await res.text()).slice(0, 200_000);
    return {
      url,
      title: meta(html, ["og:title", "twitter:title"]) ?? titleTag(html) ?? null,
      description: meta(html, ["og:description", "twitter:description", "description"]),
      image: absolutize(meta(html, ["og:image", "twitter:image"]), url),
      siteName: meta(html, ["og:site_name"]) ?? hostnameOf(url),
    };
  } catch {
    return fallback;
  }
}

function normalizeUrl(s: string): string {
  return s.trim().replace(/\s+$/, "");
}

function hostnameOf(s: string): string | null {
  try {
    return new URL(s).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function absolutize(maybeRel: string | null, base: string): string | null {
  if (!maybeRel) return null;
  try {
    return new URL(maybeRel, base).toString();
  } catch {
    return null;
  }
}

function meta(html: string, names: string[]): string | null {
  for (const name of names) {
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${escapeRe(name)}["'][^>]*content=["']([^"']+)["']`,
        "i",
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${escapeRe(name)}["']`,
        "i",
      ),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) return decode(m[1]);
    }
  }
  return null;
}

function titleTag(html: string): string | null {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m?.[1] ? decode(m[1]) : null;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
