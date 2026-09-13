import type { SeoRoutePath } from "@/config/seo-routes";

import type { SeoToolPageContent } from "./tool-page-content";

export type TargetSizeRoutePath =
  | "/compress-image-to-100kb"
  | "/compress-image-to-200kb"
  | "/compress-image-to-500kb"
  | "/compress-image-to-1mb";

export const TARGET_SIZE_ROUTE_PATHS: readonly TargetSizeRoutePath[] = [
  "/compress-image-to-100kb",
  "/compress-image-to-200kb",
  "/compress-image-to-500kb",
  "/compress-image-to-1mb",
];

const SPEC = {
  "/compress-image-to-100kb": {
    bytes: "102,400 bytes",
    label: "100 KB",
    scenario: "strict application forms, compact avatars and lightweight thumbnails",
  },
  "/compress-image-to-200kb": {
    bytes: "204,800 bytes",
    label: "200 KB",
    scenario: "forms, article images and restrained product thumbnails",
  },
  "/compress-image-to-500kb": {
    bytes: "512,000 bytes",
    label: "500 KB",
    scenario: "larger product imagery, portfolio previews and content-page heroes",
  },
  "/compress-image-to-1mb": {
    bytes: "1,048,576 bytes",
    label: "1 MB",
    scenario: "detailed photographs and high-resolution uploads with a moderate cap",
  },
} as const;

export function isTargetSizeRoutePath(path: SeoRoutePath): path is TargetSizeRoutePath {
  return (TARGET_SIZE_ROUTE_PATHS as readonly SeoRoutePath[]).includes(path);
}

export function getTargetSizePageContent(path: TargetSizeRoutePath): SeoToolPageContent {
  const spec = SPEC[path];
  return {
    facts: [
      { label: "Target", value: `${spec.label} or less` },
      { label: "Byte ceiling", value: spec.bytes },
      { label: "Default output", value: "WebP with Smart Fit available" },
    ],
    faq: [
      {
        answer: `The worker searches for the highest tested WebP quality whose encoded result is at or below ${spec.label}. If quality alone cannot reach the cap, Smart Fit can progressively reduce dimensions and try again.`,
        question: `How does the ${spec.label} target work?`,
      },
      {
        answer:
          "No fixed target can guarantee identical visual quality for every image. Detailed or noisy images need more bytes. The result shows the achieved size, quality and dimensions so you can judge the tradeoff.",
        question: "Will the result keep the same quality?",
      },
      {
        answer:
          "No. Files selected from your device stay in the browser. Iterative encodes run in a dedicated worker and only the approved result is offered for download.",
        question: "Is my image uploaded during the size search?",
      },
    ],
    guideIntro: `This route starts at a real ${spec.label} ceiling (${spec.bytes}), suited to ${spec.scenario}. The result is accepted only when an encoded candidate meets the cap.`,
    guideTitle: `Aim for ${spec.label} with a measured result, not an estimate.`,
    howItWorks: [
      {
        body: "Add JPEG, PNG, WebP or static AVIF images. Content and dimensions are validated locally.",
        title: "Choose images",
      },
      {
        body: `${spec.label} is preselected in the first settings control. Keep Smart Fit enabled when dimension reduction is acceptable.`,
        title: "Confirm the ceiling",
      },
      {
        body: "The worker performs bounded encoding attempts, reports the closest valid result and explains when the target cannot be met.",
        title: "Review the search result",
      },
    ],
    privacy:
      "Every quality and dimension attempt runs locally. Image bytes, filenames, previews and metadata are not posted to a target-size service.",
    relatedHeading: "Other image size targets",
    useCases: [
      `Prepare images for a form or CMS that enforces a ${spec.label} maximum.`,
      "Batch-check real encoded sizes instead of relying on an estimated quality percentage.",
      "Allow Smart Fit to trade dimensions only when quality search cannot meet the limit.",
    ],
    why: [
      {
        body: "A bounded binary search tests actual encoder output; the page does not infer file size from source dimensions or a generic percentage.",
        title: "Actual bytes decide",
      },
      {
        body: "Targets can be impossible without a severe tradeoff. Structured failure states remain honest rather than labeling an oversized result as success.",
        title: "Failure is explicit",
      },
    ],
  };
}
