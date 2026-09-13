import type { SeoRoutePath } from "@/config/seo-routes";

import type { SeoToolPageContent } from "./tool-page-content";

export type ConversionRoutePath = "/image-converter" | "/jpg-to-webp" | "/png-to-webp";

export const CONVERSION_ROUTE_PATHS: readonly ConversionRoutePath[] = [
  "/image-converter",
  "/jpg-to-webp",
  "/png-to-webp",
];

const CONTENT = {
  "/image-converter": {
    facts: [
      { label: "Inputs", value: "JPEG, PNG, WebP, static AVIF" },
      { label: "Outputs", value: "JPEG, PNG, WebP, static AVIF" },
      { label: "Default output", value: "WebP — change it in Format settings" },
    ],
    faq: [
      {
        answer:
          "JPEG, PNG, WebP and static AVIF can be used as inputs and outputs. Animated images are outside this tool's scope.",
        question: "Which image formats can I convert?",
      },
      {
        answer:
          "Transparency is retained when the destination supports alpha, such as PNG, WebP or AVIF. JPEG has no alpha channel, so transparent pixels are composited onto the background color shown in Format settings.",
        question: "What happens to transparent pixels?",
      },
      {
        answer:
          "No. Files chosen from your device are decoded, converted and packaged locally in browser workers. Image URL and Website URL modes only contact the network for the remote resource you ask to fetch.",
        question: "Are local files uploaded for conversion?",
      },
    ],
    guideIntro:
      "WebP is preselected as a practical web default. Open Format settings to choose JPEG, PNG or AVIF, then adjust quality or dimensions when the destination calls for it.",
    guideTitle: "Choose the destination format for the job.",
    howItWorks: [
      {
        body: "Add one supported static image or a batch. Content signatures are checked instead of trusting filename extensions.",
        title: "Choose source images",
      },
      {
        body: "Use the preselected WebP output or choose JPEG, PNG or AVIF. JPEG conversions expose an explicit transparency background.",
        title: "Set the output",
      },
      {
        body: "Browser workers decode and encode each file, then provide correctly named individual downloads or a ZIP.",
        title: "Convert locally",
      },
    ],
    privacy:
      "Local files, filenames, previews and metadata stay on your device. Metadata removal remains enabled by default.",
    relatedHeading: "Popular conversion tools",
    useCases: [
      "Create modern web assets from a mixed batch of supported static formats.",
      "Convert transparent artwork without accidentally choosing a format that drops alpha.",
      "Standardize output format, dimensions and filenames before publishing.",
    ],
    why: [
      {
        body: "One shared format setting controls the real encoder; this page is not a renamed upload form or a separate conversion demo.",
        title: "A real format workflow",
      },
      {
        body: "Every result reports its actual output format, dimensions and byte size so a larger conversion is visible before download.",
        title: "Compare before replacing",
      },
    ],
  },
  "/jpg-to-webp": {
    facts: [
      { label: "Accepted input", value: "JPEG and JPG" },
      { label: "Preselected output", value: "WebP" },
      { label: "Controls", value: "Quality, resize, naming and metadata" },
    ],
    faq: [
      {
        answer:
          "Often, but not always. The result depends on the source encoding, image content, chosen quality and dimensions. The result list shows the actual byte change rather than promising a fixed saving.",
        question: "Will WebP always be smaller than JPG?",
      },
      {
        answer:
          "Use the preview and byte comparison. Smart mode is a careful starting point; detailed or already-compressed photographs may need a manual quality choice.",
        question: "Which WebP quality should I use?",
      },
      {
        answer:
          "Yes. Add multiple JPEG/JPG files, process the bounded worker queue and download successful WebP results individually or together as a ZIP.",
        question: "Can I convert several JPG files at once?",
      },
    ],
    guideIntro:
      "This route accepts verified JPEG content and starts with WebP selected, while keeping quality, maximum dimensions and output naming available for deliberate adjustments.",
    guideTitle: "A focused JPEG-to-WebP path, not a filename swap.",
    howItWorks: [
      {
        body: "Choose JPEG/JPG images. Other verified input formats are rejected before a preview is decoded.",
        title: "Add JPG files",
      },
      {
        body: "WebP is already selected. Keep Smart quality or choose a manual value and optional maximum dimensions.",
        title: "Tune the WebP",
      },
      {
        body: "The worker normalizes orientation, encodes WebP and reports the measured result for review and download.",
        title: "Review real savings",
      },
    ],
    privacy:
      "JPEG bytes and EXIF stay in the browser. Metadata removal is on by default because camera files can include device, time and location details.",
    relatedHeading: "Related conversion tools",
    useCases: [
      "Prepare photographic JPG exports for websites that support WebP.",
      "Convert a batch while bounding oversized camera dimensions.",
      "Remove embedded photo metadata during the same local workflow.",
    ],
    why: [
      {
        body: "The picker accepts JPEG/JPG only and the shared settings controller starts on WebP, preventing an accidental keep-original run.",
        title: "The pair is genuinely preset",
      },
      {
        body: "EXIF orientation is applied before encoding, so portrait photos retain their intended display orientation.",
        title: "Photo orientation handled",
      },
    ],
  },
  "/png-to-webp": {
    facts: [
      { label: "Accepted input", value: "PNG" },
      { label: "Preselected output", value: "WebP" },
      { label: "Transparency", value: "Retained in WebP" },
    ],
    faq: [
      {
        answer:
          "Yes. WebP supports an alpha channel, and this conversion path preserves transparent pixels. The preview lets you inspect the result before download.",
        question: "Does PNG-to-WebP keep transparency?",
      },
      {
        answer:
          "WebP can be much smaller for photographic or complex PNGs, but simple or already-optimized assets may not improve. Use the reported byte comparison for each file.",
        question: "Is WebP always smaller than PNG?",
      },
      {
        answer:
          "The current WebP output uses adjustable lossy quality. Keep PNG when you require a lossless source asset; use this route when a smaller delivery asset is the goal.",
        question: "Is the converted WebP lossless?",
      },
    ],
    guideIntro:
      "PNG-only intake and a preselected WebP output make the conversion explicit. Transparency stays intact while Smart or manual quality controls the delivery tradeoff.",
    guideTitle: "Turn transparent PNGs into lighter delivery assets.",
    howItWorks: [
      {
        body: "Add verified PNG files. JPEG, WebP and AVIF inputs are rejected on this focused route.",
        title: "Choose PNG assets",
      },
      {
        body: "WebP is selected from the first render. Adjust quality or dimensions without changing the alpha-capable destination.",
        title: "Set the tradeoff",
      },
      {
        body: "A browser worker converts the batch and exposes previews, byte differences and correctly suffixed WebP downloads.",
        title: "Inspect and download",
      },
    ],
    privacy:
      "PNG pixels, alpha data and filenames remain local. No upload endpoint is used for files selected from your device.",
    relatedHeading: "Related conversion tools",
    useCases: [
      "Create smaller transparent logos and interface assets for compatible browsers.",
      "Convert large screenshot batches while keeping their original dimensions.",
      "Compare WebP delivery files against losslessly optimized PNG sources.",
    ],
    why: [
      {
        body: "The output remains alpha-capable, avoiding the opaque background introduced by a JPEG conversion.",
        title: "Transparency stays intentional",
      },
      {
        body: "Actual savings and growth are both shown. An unhelpful conversion never needs to replace the source PNG.",
        title: "No automatic victory claim",
      },
    ],
  },
} as const satisfies Record<ConversionRoutePath, SeoToolPageContent>;

export function isConversionRoutePath(path: SeoRoutePath): path is ConversionRoutePath {
  return (CONVERSION_ROUTE_PATHS as readonly SeoRoutePath[]).includes(path);
}

export function getConversionPageContent(path: ConversionRoutePath) {
  return CONTENT[path];
}
