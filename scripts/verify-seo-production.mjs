#!/usr/bin/env node

const args = process.argv.slice(2);
const requireGa = args.includes("--require-ga");
const baseArgument = args.find((argument) => !argument.startsWith("--"));
const configuredBase = baseArgument ?? process.env.SEO_PRODUCTION_URL;

if (!configuredBase) {
  console.error(
    "Usage: npm run verify:seo:production -- https://example.com [--require-ga]",
  );
  process.exit(2);
}

let origin;
try {
  const parsed = new URL(configuredBase);
  if (parsed.protocol !== "https:") throw new Error("HTTPS is required.");
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("Use the site origin without a path, query, or fragment.");
  }
  origin = parsed.origin;
} catch (error) {
  console.error(`Invalid production URL: ${error.message}`);
  process.exit(2);
}

const failures = [];
const notes = [];

function record(condition, message) {
  if (!condition) failures.push(message);
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(new URL(path, origin), {
      ...options,
      headers: {
        "user-agent": "CompressByURL production SEO verifier/1.0",
        ...options.headers,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function matches(html, expression) {
  return [...html.matchAll(expression)];
}

function attributeValue(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? null;
}

function normalizedUrl(value) {
  const url = new URL(value, origin);
  url.hash = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/$/, "");
  return url.href;
}

function schemaTypes(html) {
  const types = new Set();
  for (const match of matches(
    html,
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const value = JSON.parse(match[1]);
      const queue = [value];
      while (queue.length) {
        const item = queue.shift();
        if (!item || typeof item !== "object") continue;
        if (typeof item["@type"] === "string") types.add(item["@type"]);
        if (Array.isArray(item["@type"]))
          item["@type"].forEach((type) => types.add(type));
        Object.values(item).forEach((child) => {
          if (child && typeof child === "object") queue.push(child);
        });
      }
    } catch {
      failures.push("A page contains invalid JSON-LD.");
    }
  }
  return types;
}

async function main() {
  const robotsResponse = await request("/robots.txt");
  const robots = await robotsResponse.text();
  record(robotsResponse.status === 200, `robots.txt returned ${robotsResponse.status}.`);
  record(/disallow:\s*\/api\//i.test(robots), "robots.txt does not disallow /api/.");
  record(/disallow:\s*\/dev\//i.test(robots), "robots.txt does not disallow /dev/.");
  record(
    robots.includes(`${origin}/sitemap.xml`),
    "robots.txt does not advertise the production sitemap.",
  );

  const sitemapResponse = await request("/sitemap.xml");
  const sitemap = await sitemapResponse.text();
  record(
    sitemapResponse.status === 200,
    `sitemap.xml returned ${sitemapResponse.status}.`,
  );
  const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => match[1],
  );
  record(
    sitemapUrls.length === 24,
    `Expected 24 sitemap URLs; found ${sitemapUrls.length}.`,
  );
  record(
    sitemapUrls.every((value) => new URL(value).origin === origin),
    "The sitemap contains a URL on another origin.",
  );

  const titles = new Set();
  const descriptions = new Set();
  const headings = new Set();

  for (const pageUrl of sitemapUrls) {
    const path = new URL(pageUrl).pathname;
    const response = await request(path);
    const html = await response.text();
    record(response.status === 200, `${path} returned ${response.status}.`);

    const title = matches(html, /<title[^>]*>([\s\S]*?)<\/title>/gi);
    const h1 = matches(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
    const metaTags = matches(html, /<meta\b[^>]*>/gi).map((match) => match[0]);
    const descriptionTags = metaTags.filter(
      (tag) => attributeValue(tag, "name")?.toLowerCase() === "description",
    );
    const robotsTags = metaTags.filter(
      (tag) => attributeValue(tag, "name")?.toLowerCase() === "robots",
    );
    const canonicalTags = matches(html, /<link\b[^>]*>/gi)
      .map((match) => match[0])
      .filter((tag) => attributeValue(tag, "rel")?.toLowerCase() === "canonical");

    record(title.length === 1, `${path} has ${title.length} title elements.`);
    record(h1.length === 1, `${path} has ${h1.length} H1 elements.`);
    record(
      descriptionTags.length === 1,
      `${path} has ${descriptionTags.length} meta descriptions.`,
    );
    record(canonicalTags.length === 1, `${path} has ${canonicalTags.length} canonicals.`);
    record(
      !robotsTags.some((tag) => /noindex/i.test(attributeValue(tag, "content") ?? "")),
      `${path} is marked noindex.`,
    );

    if (title[0]) titles.add(title[0][1].trim());
    if (h1[0])
      headings.add(
        h1[0][1]
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      );
    if (descriptionTags[0])
      descriptions.add(attributeValue(descriptionTags[0], "content"));
    if (canonicalTags[0]) {
      const canonical = attributeValue(canonicalTags[0], "href");
      record(
        canonical && normalizedUrl(canonical) === normalizedUrl(pageUrl),
        `${path} does not self-canonicalize to its sitemap URL.`,
      );
    }

    const types = schemaTypes(html);
    if (path === "/") {
      record(types.has("WebSite"), "/ is missing WebSite schema.");
      record(
        types.has("SoftwareApplication"),
        "/ is missing SoftwareApplication schema.",
      );
    } else if (path === "/learn") {
      record(!types.has("Article"), "/learn should not emit Article schema.");
    } else if (path.startsWith("/learn/")) {
      record(types.has("Article"), `${path} is missing Article schema.`);
      record(types.has("BreadcrumbList"), `${path} is missing BreadcrumbList schema.`);
    } else {
      record(types.has("WebApplication"), `${path} is missing WebApplication schema.`);
      record(types.has("FAQPage"), `${path} is missing FAQPage schema.`);
      record(types.has("BreadcrumbList"), `${path} is missing BreadcrumbList schema.`);
    }

    const hasGa = /googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9]+/i.test(html);
    if (path === "/") {
      if (requireGa) record(hasGa, "GA4 was required but no production tag was found.");
      notes.push(`GA4 tag: ${hasGa ? "present" : "not detected"}`);
      notes.push(
        `Search Console HTML verification tag: ${/name=["']google-site-verification["']/i.test(html) ? "present" : "not detected (DNS verification may be used)"}`,
      );
    }
  }

  record(titles.size === sitemapUrls.length, "Sitemap page titles are not unique.");
  record(
    descriptions.size === sitemapUrls.length,
    "Sitemap meta descriptions are not unique.",
  );
  record(headings.size === sitemapUrls.length, "Sitemap H1s are not unique.");

  const aliases = new Map([
    ["/compress-by-url", "/compress-image-from-url"],
    ["/image-url-compressor", "/compress-image-from-url"],
    ["/optimize-image-from-url", "/compress-image-from-url"],
    ["/optimize-images-from-webpage", "/website-image-optimizer"],
  ]);
  for (const [source, destination] of aliases) {
    const response = await request(source, { redirect: "manual" });
    record(response.status === 308, `${source} returned ${response.status}, not 308.`);
    const location = response.headers.get("location");
    record(
      location && normalizedUrl(location) === normalizedUrl(destination),
      `${source} does not redirect to ${destination}.`,
    );
  }

  for (const path of [
    "/download-images-from-url",
    `/seo-verifier-missing-${Date.now()}`,
  ]) {
    const response = await request(path);
    const html = await response.text();
    record(response.status === 404, `${path} returned ${response.status}, not 404.`);
    record(/noindex/i.test(html), `${path} does not expose a noindex directive.`);
  }

  console.log(`Production SEO verification: ${origin}`);
  console.log(`Sitemap pages checked: ${sitemapUrls.length}`);
  notes.forEach((note) => console.log(note));
  if (failures.length) {
    console.error(`FAILED (${failures.length})`);
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
  } else {
    console.log("PASS: all automated production SEO checks succeeded.");
  }
}

main().catch((error) => {
  console.error(`Production SEO verification could not complete: ${error.message}`);
  process.exitCode = 1;
});
