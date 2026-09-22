import { load, type CheerioAPI } from "cheerio";

import type {
  ImageCandidateSource,
  WebsiteImageCandidate,
  WebsiteScanManifest,
} from "./schemas.js";

const LAZY_SOURCE_ATTRIBUTES = ["data-src", "data-original", "data-lazy-src"] as const;

function cleanText(value: string | undefined, maxLength: number) {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function parseDimension(value: string | undefined) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 100_000 ? parsed : null;
}

function resolveCandidateUrl(value: string | undefined, pageUrl: string) {
  if (!value) return null;
  try {
    const url = new URL(value.trim(), pageUrl);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
      return null;
    }
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function srcsetUrls(value: string | undefined) {
  if (!value) return [];
  return value
    .split(",")
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter((candidate): candidate is string => Boolean(candidate));
}

interface CandidateDetails {
  alt: string | undefined;
  declaredHeight: string | undefined;
  declaredWidth: string | undefined;
}

function createCollector(pageUrl: string, maxCandidates: number) {
  const candidates = new Map<string, Omit<WebsiteImageCandidate, "id">>();
  const discoveredUrls = new Set<string>();

  function add(
    rawUrl: string | undefined,
    source: ImageCandidateSource,
    details: CandidateDetails = {
      alt: undefined,
      declaredHeight: undefined,
      declaredWidth: undefined,
    },
  ) {
    const url = resolveCandidateUrl(rawUrl, pageUrl);
    if (!url) return;
    discoveredUrls.add(url);
    const existing = candidates.get(url);
    if (existing) {
      if (!existing.sources.includes(source)) existing.sources.push(source);
      return;
    }
    if (candidates.size >= maxCandidates) return;
    candidates.set(url, {
      alt: cleanText(details.alt, 300),
      declaredHeight: parseDimension(details.declaredHeight),
      declaredWidth: parseDimension(details.declaredWidth),
      source,
      sources: [source],
      url,
    });
  }

  return {
    add,
    finish() {
      return {
        candidates: Array.from(candidates.values(), (candidate, index) => ({
          ...candidate,
          id: `image-${index + 1}`,
        })),
        totalFound: discoveredUrls.size,
        truncated: discoveredUrls.size > candidates.size,
      };
    },
  };
}

function collectImageElements($: CheerioAPI, pageUrl: string, maxCandidates: number) {
  const collector = createCollector(pageUrl, maxCandidates);

  $("img").each((_index, element) => {
    const image = $(element);
    const details = {
      alt: image.attr("alt"),
      declaredHeight: image.attr("height"),
      declaredWidth: image.attr("width"),
    };
    collector.add(image.attr("src"), "image", details);
    for (const attribute of LAZY_SOURCE_ATTRIBUTES) {
      collector.add(image.attr(attribute), "lazy-image", details);
    }
    for (const url of srcsetUrls(image.attr("srcset") ?? image.attr("data-srcset"))) {
      collector.add(url, "srcset", details);
    }
  });

  $("picture source").each((_index, element) => {
    for (const url of srcsetUrls($(element).attr("srcset"))) {
      collector.add(url, "picture");
    }
  });

  $(
    'meta[property="og:image"], meta[name="twitter:image"], meta[property="twitter:image"]',
  ).each((_index, element) => collector.add($(element).attr("content"), "metadata"));

  $('link[rel~="preload"][as="image"]').each((_index, element) => {
    const link = $(element);
    collector.add(link.attr("href"), "preload");
    for (const url of srcsetUrls(link.attr("imagesrcset"))) {
      collector.add(url, "preload");
    }
  });

  return collector.finish();
}

export function extractWebsiteScanManifest(
  html: string,
  pageUrl: string,
  maxCandidates: number,
): WebsiteScanManifest {
  const normalizedMax = Math.min(80, Math.max(1, Math.trunc(maxCandidates)));
  const $ = load(html, null, false);
  const { candidates, totalFound, truncated } = collectImageElements(
    $,
    pageUrl,
    normalizedMax,
  );
  return {
    page: {
      title: cleanText($("title").first().text(), 200),
      url: pageUrl,
    },
    candidates,
    totalFound,
    limits: { maxCandidates: normalizedMax, truncated },
  };
}
