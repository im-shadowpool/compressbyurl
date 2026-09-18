import type { SeoRoutePath } from "@/config/seo-routes";

import type { EditorialRoutePath } from "@/config/editorial-routes";

export type EditorialArticlePath = Exclude<EditorialRoutePath, "/learn">;

interface EditorialTable {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
}

interface EditorialSection {
  bullets?: readonly string[];
  paragraphs: readonly string[];
  table?: EditorialTable;
  title: string;
}

interface EditorialSource {
  label: string;
  url: string;
}

interface EditorialToolLink {
  description: string;
  label: string;
  path: SeoRoutePath;
}

export interface EditorialArticleContent {
  dek: string;
  readingTime: string;
  reviewedOn: string;
  sections: readonly EditorialSection[];
  sources: readonly EditorialSource[];
  summary: readonly string[];
  toolLinks: readonly EditorialToolLink[];
}

export const ARTICLE_PATHS: readonly EditorialArticlePath[] = [
  "/learn/webp-vs-avif-vs-jpeg",
  "/learn/how-target-size-compression-works",
  "/learn/find-large-images-on-a-website",
];

const CONTENT = {
  "/learn/webp-vs-avif-vs-jpeg": {
    dek: "There is no permanently smallest format for every image. Start with the content, browser requirements and transparency needs, then compare outputs from the same source.",
    readingTime: "6 minute guide",
    reviewedOn: "September 14, 2026",
    sections: [
      {
        paragraphs: [
          "JPEG remains a dependable choice for photographs when broad compatibility and quick encoding matter. It is lossy and does not carry an alpha transparency channel.",
          "WebP supports lossy and lossless compression plus transparency. It is a practical modern default when you want one format for photographs and transparent graphics across current browsers.",
          "AVIF can be very efficient for photographic content and supports transparency, but encoding is usually heavier. That tradeoff matters in an interactive browser tool and in build pipelines.",
        ],
        table: {
          columns: ["Question", "JPEG", "WebP", "AVIF"],
          rows: [
            [
              "Photo delivery",
              "Dependable baseline",
              "Strong general default",
              "Worth testing for lower bytes",
            ],
            ["Transparency", "No", "Yes", "Yes"],
            ["Encoding effort", "Usually lowest", "Moderate", "Usually highest"],
            [
              "Best decision rule",
              "Compatibility first",
              "Balanced default",
              "Measure savings against encode cost",
            ],
          ],
        },
        title: "The useful differences",
      },
      {
        paragraphs: [
          "Imagine a 2400 × 1600 product photograph with no transparency. Export the same resized source to JPEG, WebP and AVIF, then compare bytes and visible detail at the intended display size. If AVIF saves only a small amount for noticeably slower encoding, WebP or JPEG may be the better operational choice.",
          "Now imagine a logo with soft transparent edges. JPEG is removed from the shortlist because it needs a solid background. Compare PNG, WebP and AVIF instead; a photographic format comparison would answer the wrong question.",
        ],
        title: "Two examples, two different shortlists",
      },
      {
        bullets: [
          "Resize to the largest dimension the layout actually needs before judging formats.",
          "Use the same source pixels and inspect at the real display size.",
          "Compare bytes, visual artifacts, transparency and encode time together.",
          "Keep a fallback only when your browser or delivery requirements call for one.",
        ],
        paragraphs: [
          "A format label is not a performance result. Dimensions and quality settings can outweigh the container choice, and an already efficient source can grow after re-encoding.",
        ],
        title: "A repeatable decision process",
      },
    ],
    sources: [
      {
        label: "MDN image file type guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types",
      },
      {
        label: "web.dev image performance guide",
        url: "https://web.dev/learn/performance/image-performance",
      },
    ],
    summary: [
      "JPEG is a safe photographic baseline without transparency.",
      "WebP is a balanced modern default with lossy, lossless and alpha-capable paths.",
      "AVIF is worth measuring when byte savings justify its encoding cost.",
    ],
    toolLinks: [
      {
        description: "Export the same source to WebP and compare measured output.",
        label: "Open the image converter",
        path: "/image-converter",
      },
      {
        description: "Resize oversized source pixels before comparing formats.",
        label: "Resize an image",
        path: "/resize-image",
      },
    ],
  },
  "/learn/how-target-size-compression-works": {
    dek: "A target such as 200 KB is a constraint, not a quality setting. A useful compressor searches for the best tested output under that ceiling and admits when quality alone cannot get there.",
    readingTime: "7 minute guide",
    reviewedOn: "September 14, 2026",
    sections: [
      {
        paragraphs: [
          "Lossy encoders usually accept a quality value, but the resulting byte size depends on the image. A detailed photograph and a flat illustration can produce very different sizes at the same quality.",
          "That is why a 200 KB mode cannot simply map to one magic quality percentage. It must encode, measure and adjust within a bounded search.",
        ],
        title: "Quality does not predict bytes",
      },
      {
        paragraphs: [
          "Suppose a 3000 × 2000 photograph starts at 2.8 MB and must fit under 200 KB. The compressor first tests qualities inside a safe range. If 74 produces 218 KB and 71 produces 194 KB, 71 is the best tested result under the ceiling—not proof of a mathematically perfect global optimum.",
          "If even the lowest allowed quality remains over 200 KB, Smart Fit can reduce dimensions proportionally and repeat the search. CompressByURL stops at a documented shorter-edge floor rather than shrinking indefinitely.",
        ],
        table: {
          columns: ["Attempt", "Illustrative result", "Decision"],
          rows: [
            ["Quality 82", "286 KB", "Over target"],
            ["Quality 74", "218 KB", "Over target"],
            ["Quality 71", "194 KB", "Keep as best tested pass"],
            ["If all fail", "Still over 200 KB", "Offer proportional Smart Fit"],
          ],
        },
        title: "An illustrative search",
      },
      {
        bullets: [
          "A byte ceiling can require visible loss; no tool can guarantee otherwise.",
          "Very small targets may require fewer pixels, not just lower quality.",
          "Lossless PNG has no meaningful lossy quality search unless you convert formats.",
          "The correct failure state is explicit: target not reached within the allowed bounds.",
        ],
        paragraphs: [
          "The example values above illustrate the decision path; they are not a benchmark or promised output for another image.",
        ],
        title: "What an honest target tool must say",
      },
    ],
    sources: [],
    summary: [
      "Target size is verified from encoded bytes, not guessed from a slider.",
      "Bounded search keeps the highest tested quality that meets the ceiling.",
      "Dimension reduction is a separate, explicit fallback when quality is insufficient.",
    ],
    toolLinks: [
      {
        description: "Start with the 200 KB target size used in the worked example.",
        label: "Compress to 200 KB",
        path: "/compress-image-to-200kb",
      },
      {
        description: "Control quality, formats, or target size manually.",
        label: "Open the general compressor",
        path: "/compress-image",
      },
    ],
  },
  "/learn/find-large-images-on-a-website": {
    dek: "A useful audit separates transfer weight, intrinsic pixel dimensions and rendered size. One number cannot tell you whether an image is actually a problem.",
    readingTime: "8 minute guide",
    reviewedOn: "September 14, 2026",
    sections: [
      {
        paragraphs: [
          "File bytes affect transfer and decode work. Intrinsic width and height describe the source pixels. Rendered dimensions describe the space the browser gives the image in the layout.",
          "A 2400-pixel image rendered at 400 CSS pixels may be oversized, but device pixel ratio and responsive variants matter. The goal is not to force every source to equal its CSS width; it is to serve an appropriate candidate for the display conditions.",
        ],
        table: {
          columns: ["Signal", "What it tells you", "What it cannot prove alone"],
          rows: [
            ["Transfer bytes", "Network weight", "Whether dimensions are appropriate"],
            ["Intrinsic size", "Available source pixels", "Actual rendered size"],
            [
              "Rendered size",
              "Layout footprint",
              "Which responsive candidate downloaded",
            ],
            [
              "width / height",
              "Reserved aspect-ratio space",
              "Visual quality or byte efficiency",
            ],
          ],
        },
        title: "Measure three different things",
      },
      {
        paragraphs: [
          "Consider a card image declared as 1600 × 1200, transferred at 420 KB and rendered around 360 × 270 CSS pixels. It deserves inspection: resize or add a `srcset` candidate near the required density, then encode and measure again.",
          "By contrast, a 180 KB hero rendered across a 1440-pixel desktop may be dimensionally appropriate even though it is the largest image on the page. Priority depends on user-visible position, responsive behavior and field performance—not rank by bytes alone.",
        ],
        title: "A candidate, not a verdict",
      },
      {
        bullets: [
          "Check `<img src>`, `srcset`, `<picture>` sources, lazy-load attributes, preloads and social metadata separately.",
          "Flag missing width and height because reserved aspect ratio helps prevent layout movement.",
          "Inspect the actually downloaded candidate in browser developer tools when scripts or responsive selection matter.",
          "Re-run a performance measurement after replacement; an HTML scan is not a Core Web Vitals test.",
        ],
        paragraphs: [
          "CompressByURL's scanner parses one public HTML response without executing scripts. It is useful for discovery, but it cannot see every client-rendered image or reproduce a user's full runtime environment.",
        ],
        title: "A disciplined audit loop",
      },
    ],
    sources: [
      {
        label: "HTML responsive images specification",
        url: "https://html.spec.whatwg.org/multipage/images.html",
      },
      {
        label: "web.dev image performance guide",
        url: "https://web.dev/learn/performance/image-performance",
      },
      {
        label: "web.dev image width and height guidance",
        url: "https://web.dev/articles/optimize-cls#images-without-dimensions",
      },
    ],
    summary: [
      "Bytes, source pixels and rendered size answer different questions.",
      "Responsive candidates and device density prevent a simple one-to-one width rule.",
      "A static HTML scan finds candidates; runtime and field tools verify impact.",
    ],
    toolLinks: [
      {
        description: "Inventory discoverable candidates on one public webpage.",
        label: "Run the website image scanner",
        path: "/website-image-scanner",
      },
      {
        description:
          "Select candidates, optimize locally and create a replacement bundle.",
        label: "Open the website optimizer",
        path: "/website-image-optimizer",
      },
    ],
  },
} as const satisfies Record<EditorialArticlePath, EditorialArticleContent>;

export function isEditorialArticlePath(
  path: EditorialRoutePath,
): path is EditorialArticlePath {
  return ARTICLE_PATHS.includes(path as EditorialArticlePath);
}

export function getEditorialContent(path: EditorialArticlePath) {
  return CONTENT[path];
}
