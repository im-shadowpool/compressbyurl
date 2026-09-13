import type { SeoRoutePath } from "@/config/seo-routes";

import type { SeoToolPageContent } from "./tool-page-content";

export type ResizeRoutePath = "/resize-image";

export function isResizeRoutePath(path: SeoRoutePath): path is ResizeRoutePath {
  return path === "/resize-image";
}

export const RESIZE_PAGE_CONTENT = {
  facts: [
    { label: "Inputs", value: "JPEG, PNG, WebP, static AVIF" },
    { label: "Resize modes", value: "Fit within bounds or exact dimensions" },
    { label: "Upscaling", value: "Prevented by the processing engine" },
  ],
  faq: [
    {
      answer:
        "Fit mode keeps the image inside maximum width and height bounds while preserving its proportions. Exact mode creates the requested canvas dimensions and can use a centered proportional crop when aspect ratio is maintained.",
      question: "What is the difference between fit and exact resize?",
    },
    {
      answer:
        "No. The resize plan prevents upscaling, so an image that is already smaller than the requested bounds keeps its original dimensions.",
      question: "Will a small image be enlarged?",
    },
    {
      answer:
        "Yes. Keep original format to resize only, or choose JPEG, PNG, WebP or static AVIF output and adjust compression settings in the same local workflow.",
      question: "Can I resize and convert at the same time?",
    },
  ],
  guideIntro:
    "The Resize control is placed first on this route. Choose maximum bounds for a non-cropping fit, or exact dimensions when every output needs the same canvas.",
  guideTitle: "Resize by intent, not by a single ambiguous width box.",
  howItWorks: [
    {
      body: "Add one supported static image or a batch. The browser reads verified dimensions and prepares local previews.",
      title: "Choose images",
    },
    {
      body: "Open the first settings control, enable resizing and choose fit or exact dimensions. Smaller sources are never enlarged.",
      title: "Set the geometry",
    },
    {
      body: "Workers resize and encode the queue locally. Review dimensions and bytes before downloading individual files or a ZIP.",
      title: "Verify the outputs",
    },
  ],
  privacy:
    "Image pixels, dimensions, filenames and metadata remain in your browser. Local files are not posted to a resizing service.",
  relatedHeading: "Related image tools",
  useCases: [
    "Bound oversized photos before publishing them in a CMS.",
    "Create consistently sized thumbnails with an exact centered crop.",
    "Resize a mixed-format batch while keeping each file's original format.",
  ],
  why: [
    {
      body: "Maximum width and height preserve the full image inside a box; exact mode is explicit when cropping may be required.",
      title: "Two clear resize modes",
    },
    {
      body: "The worker protocol owns resize calculations and encoding, keeping React clear of pixel-processing internals and the page responsive.",
      title: "Built on the production path",
    },
  ],
} as const satisfies SeoToolPageContent;
