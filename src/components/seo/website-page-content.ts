import type { SeoRoutePath } from "@/config/seo-routes";

import type { SeoToolPageContent } from "./tool-page-content";

export type WebsiteRoutePath = "/website-image-optimizer" | "/website-image-scanner";

export const WEBSITE_ROUTE_PATHS: readonly WebsiteRoutePath[] = [
  "/website-image-optimizer",
  "/website-image-scanner",
];

const CONTENT = {
  "/website-image-optimizer": {
    facts: [
      { label: "Scan scope", value: "One public webpage per scan" },
      { label: "Selection", value: "Up to 20 supported candidates" },
      { label: "Output", value: "Optimized files plus replacement map" },
    ],
    faq: [
      {
        answer:
          "No. It fetches one public HTML document and does not follow internal links. Run another scan for another page.",
        question: "Does the optimizer crawl my whole website?",
      },
      {
        answer:
          "It discovers image URLs present in fetched HTML, including image, lazy-image, srcset, picture, social metadata and image-preload sources. It does not execute JavaScript, render the page or discover CSS background images.",
        question: "Which webpage images can it find?",
      },
      {
        answer:
          "After you select candidates, supported files are imported in a bounded queue and passed to browser workers. The ZIP can include replacement-map.json so source URLs can be matched to output filenames.",
        question: "How are replacement files created?",
      },
    ],
    guideIntro:
      "Scan one public page, inspect discoverable candidates, select the assets worth changing, then compress and package them in the same local engine used for uploads.",
    guideTitle: "Move from webpage evidence to replacement files.",
    howItWorks: [
      {
        body: "Enter one public HTTP or HTTPS webpage. The server validates the destination and fetches a bounded HTML response without credentials.",
        title: "Scan one page safely",
      },
      {
        body: "Review candidate sources, declared dimensions, formats and heuristic issue labels. Select up to 20 supported images.",
        title: "Choose real opportunities",
      },
      {
        body: "Fetch selected assets three at a time, optimize them in browser workers and download individual replacements or a mapped ZIP.",
        title: "Build the replacement bundle",
      },
    ],
    privacy:
      "The webpage URL and selected public asset URLs must be fetched over the network. Compression, previews, settings and ZIP creation run locally after import.",
    relatedHeading: "Related URL tools",
    useCases: [
      "Prepare optimized replacements for heavy images on a landing page.",
      "Resize oversized assets to better match their declared layout dimensions.",
      "Keep source-to-output filenames traceable with a replacement map.",
    ],
    why: [
      {
        body: "The workflow ends with usable replacement files, not only a score or a list of generic recommendations.",
        title: "Action follows the audit",
      },
      {
        body: "The page states what static HTML discovery misses and never claims full-site, rendered-page or script-executed coverage.",
        title: "Scope stays visible",
      },
    ],
  },
  "/website-image-scanner": {
    facts: [
      { label: "Scan scope", value: "One public HTML document" },
      { label: "Candidate cap", value: "Up to 80 discovered URLs" },
      { label: "Scripts", value: "Never executed" },
    ],
    faq: [
      {
        answer:
          "It flags missing declared dimensions, very large declared dimensions, JPEG/PNG modern-format opportunities, measured files at or above 250 KB, oversized natural dimensions and possible duplicate filename variants. These are review prompts, not a synthetic performance score.",
        question: "What image problems does the scanner flag?",
      },
      {
        answer:
          "No. It reads a fetched HTML document without running scripts or rendering CSS. Client-inserted images, canvas content, CSS backgrounds and assets behind interaction may be absent.",
        question: "Is this the same as a browser-rendered audit?",
      },
      {
        answer:
          "Yes. Select supported candidates to measure and inspect them locally, then use the same worker-backed optimizer when an audit finding is worth acting on.",
        question: "Can I optimize an image after scanning?",
      },
    ],
    guideIntro:
      "Use the scan as a focused inventory of image references visible in one page's HTML. Candidate labels point to items worth checking; they do not replace field performance data or visual review.",
    guideTitle: "Audit discoverable image problems without pretending to render the web.",
    howItWorks: [
      {
        body: "Submit one public webpage URL. Private, loopback, link-local, reserved and metadata destinations are rejected across redirects.",
        title: "Validate the target",
      },
      {
        body: "The bounded HTML parser collects supported image references and records source type, alt text and declared dimensions when present.",
        title: "Build the candidate manifest",
      },
      {
        body: "Review issue labels and recommendations. Import only the candidates that need real byte and natural-dimension measurement.",
        title: "Investigate selectively",
      },
    ],
    privacy:
      "Scanning sends the supplied public URL to the server fetch boundary. Cookies and Authorization are not forwarded, scripts are not executed and page HTML is not exposed as a generic proxy response.",
    relatedHeading: "Related URL tools",
    useCases: [
      "Inventory image references discoverable in a page's source HTML.",
      "Find missing dimensions and likely oversized or heavy candidates.",
      "Separate direct-image optimization from webpage-level discovery.",
    ],
    why: [
      {
        body: "Candidate source types distinguish ordinary images, lazy attributes, responsive sets, picture sources, social metadata and preloads.",
        title: "More than img src",
      },
      {
        body: "There is no invented grade. The scanner exposes observations, heuristic flags and measured facts so the user keeps the final judgment.",
        title: "Evidence over a score",
      },
    ],
  },
} as const satisfies Record<WebsiteRoutePath, SeoToolPageContent>;

export function isWebsiteRoutePath(path: SeoRoutePath): path is WebsiteRoutePath {
  return (WEBSITE_ROUTE_PATHS as readonly SeoRoutePath[]).includes(path);
}

export function getWebsitePageContent(path: WebsiteRoutePath) {
  return CONTENT[path];
}
