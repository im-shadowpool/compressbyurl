import type { SeoRoutePath } from "@/config/seo-routes";

import type { SeoToolPageContent } from "./tool-page-content";

export type ImageUrlRoutePath = "/compress-image-from-url";

export function isImageUrlRoutePath(path: SeoRoutePath): path is ImageUrlRoutePath {
  return path === "/compress-image-from-url";
}

export const IMAGE_URL_PAGE_CONTENT = {
  facts: [
    { label: "Input", value: "One public HTTP or HTTPS image URL" },
    { label: "Formats", value: "JPEG, PNG, WebP, static AVIF" },
    { label: "Limit", value: "25 MB fetched-image ceiling" },
  ],
  faq: [
    {
      answer:
        "Paste the URL of one image file, not a webpage containing images. Use the Website URL mode when you want to discover candidates from a page.",
      question: "Should I paste an image URL or webpage URL?",
    },
    {
      answer:
        "The browser tries a direct CORS-enabled fetch first. When that is blocked, the limited server fallback validates the public destination and response before returning image bytes to the browser.",
      question: "Why is a server fallback sometimes needed?",
    },
    {
      answer:
        "Compression, resizing, conversion, comparison and ZIP creation happen locally after the requested bytes reach your browser. The remote host necessarily receives the image request.",
      question: "What remains local in Image URL mode?",
    },
  ],
  guideIntro:
    "Paste one direct public image address. The tool validates the URL and content, imports the bytes, then hands the file to the same browser worker used for local uploads.",
  guideTitle: "Fetch remotely; optimize in the local engine.",
  howItWorks: [
    {
      body: "Enter an HTTP or HTTPS URL that points directly to a supported static image.",
      title: "Paste the direct URL",
    },
    {
      body: "A direct browser request is preferred. The constrained proxy is used only when CORS prevents access and revalidates redirects and public destinations.",
      title: "Fetch with safeguards",
    },
    {
      body: "The imported file enters the normal preview, settings, worker and download flow; encoding is not moved to the server.",
      title: "Optimize locally",
    },
  ],
  privacy:
    "URL mode must contact the remote image host and may use the limited fetch service. It does not turn local file compression into a server upload workflow.",
  relatedHeading: "Related image tools",
  useCases: [
    "Optimize a single public image when you have its direct asset URL.",
    "Compare a remote source with a resized or converted local result.",
    "Import a CORS-blocked public asset through the constrained fallback.",
  ],
  why: [
    {
      body: "Only public HTTP/HTTPS destinations and supported image responses are accepted; this is not a generic open proxy.",
      title: "A narrow fetch boundary",
    },
    {
      body: "Direct-image intent has one canonical route. Wording variants are kept as on-page language rather than duplicate indexable pages.",
      title: "One task, one URL",
    },
  ],
} as const satisfies SeoToolPageContent;
