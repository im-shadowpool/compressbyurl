import type { SeoRoutePath } from "@/config/seo-routes";
import type { SeoToolPageContent } from "./tool-page-content";

export type CompressionRoutePath =
  "/compress-image" | "/compress-jpg" | "/compress-png" | "/compress-webp";

export type CompressionPageContent = SeoToolPageContent;

export const COMPRESSION_ROUTE_PATHS: readonly CompressionRoutePath[] = [
  "/compress-image",
  "/compress-jpg",
  "/compress-png",
  "/compress-webp",
];

const CONTENT = {
  "/compress-image": {
    facts: [
      { label: "Inputs", value: "JPEG, PNG, WebP, static AVIF" },
      { label: "Outputs", value: "Keep original, JPEG, PNG, WebP, AVIF" },
      { label: "Batch", value: "Multiple files with ZIP download" },
    ],
    faq: [
      {
        answer:
          "No. Files selected from your device are decoded, compressed and packaged in your browser. URL modes use the network only to fetch the remote resource you request.",
        question: "Are my uploaded images sent to a server?",
      },
      {
        answer:
          "Smart mode chooses conservative format-aware settings. You can switch to manual quality, a target size, exact or maximum dimensions, and another output format before processing.",
        question: "What does Smart compression change?",
      },
      {
        answer:
          "JPEG/JPG, PNG, WebP and static AVIF are supported. Animated GIF, WebP and AVIF optimization is intentionally not supported.",
        question: "Which image formats can I compress?",
      },
    ],
    guideIntro:
      "Use Smart mode for a careful default, or open the settings rail when you need a particular quality, output format, dimension or byte limit.",
    guideTitle: "A practical compressor, without the upload detour.",
    howItWorks: [
      {
        body: "Choose one image or a batch. The browser validates the file signature and prepares a local preview.",
        title: "Add your images",
      },
      {
        body: "Keep Smart mode or adjust format, quality, resize, target-size, naming and metadata controls.",
        title: "Set the outcome",
      },
      {
        body: "Dedicated browser workers process the queue. Download individual results or package successful files into a ZIP.",
        title: "Compress and download",
      },
    ],
    privacy:
      "Local image bytes, filenames, previews and EXIF/GPS data stay on your device. Metadata removal is enabled by default.",
    relatedHeading: "Related compression tools",
    useCases: [
      "Reduce a mixed batch before adding it to a website or CMS.",
      "Resize oversized photos while preserving their proportions.",
      "Convert static images and compare the result before downloading.",
    ],
    why: [
      {
        body: "Compression runs away from the React main thread with bounded worker concurrency, keeping controls responsive during a batch.",
        title: "Built for real batches",
      },
      {
        body: "Results report original and output bytes, dimensions, format and metadata state instead of hiding the tradeoff behind one score.",
        title: "Measured, not mysterious",
      },
    ],
  },
  "/compress-jpg": {
    facts: [
      { label: "Input", value: "JPEG and JPG" },
      { label: "Default output", value: "JPEG/JPG" },
      { label: "Controls", value: "Smart, quality, resize, target size" },
    ],
    faq: [
      {
        answer:
          "Yes. Manual quality lets you choose from 1 to 100. Smart mode is the safer starting point when you do not already know the right value.",
        question: "Can I choose the JPEG quality?",
      },
      {
        answer:
          "Metadata is removed by default. You can opt into JPEG metadata preservation, with a warning that camera and GPS details may be included.",
        question: "Does JPG compression remove EXIF and GPS metadata?",
      },
      {
        answer:
          "A smaller file usually requires more loss. Use the before/after comparison and byte savings shown for each result to choose an acceptable balance.",
        question: "Will a compressed JPG look exactly the same?",
      },
    ],
    guideIntro:
      "JPEG is a lossy photo format, so its useful control is the balance between visible detail and byte size. Smart mode starts conservatively; manual quality gives you direct control.",
    guideTitle: "Make photographs lighter while keeping the tradeoff visible.",
    howItWorks: [
      {
        body: "Add JPEG or JPG files. Other formats are rejected on this focused page before preview decoding.",
        title: "Choose JPG files",
      },
      {
        body: "Use Smart mode, set a quality percentage, resize large dimensions or search for a target byte limit.",
        title: "Choose the balance",
      },
      {
        body: "Compare bytes and dimensions, inspect the optimized preview, then download one file or the completed batch.",
        title: "Review the result",
      },
    ],
    privacy:
      "JPEG files selected here remain in your browser. Metadata is stripped by default; preservation is an explicit opt-in because EXIF can contain time, device and location details.",
    relatedHeading: "Related compression tools",
    useCases: [
      "Prepare camera photos for articles, portfolios or product pages.",
      "Fit large JPGs within a maximum width without enlarging smaller images.",
      "Bring an application photo under a required KB limit with target-size mode.",
    ],
    why: [
      {
        body: "EXIF orientation is normalized before encoding so portrait photos do not unexpectedly rotate in the output.",
        title: "Orientation handled",
      },
      {
        body: "Target-size mode keeps the highest tested quality that fits the limit, and can offer proportional dimension reduction when quality alone is insufficient.",
        title: "Useful byte targets",
      },
    ],
  },
  "/compress-png": {
    facts: [
      { label: "Input", value: "PNG" },
      { label: "Default output", value: "Losslessly optimized PNG" },
      { label: "Transparency", value: "Preserved on the PNG path" },
    ],
    faq: [
      {
        answer:
          "Keeping PNG as the output uses a lossless PNG optimizer, so decoded pixels and transparency are preserved. Converting to another format follows that format's behavior.",
        question: "Is PNG compression lossless?",
      },
      {
        answer:
          "PNG is often appropriate for transparency, interface graphics and artwork with sharp edges. Photographs may be smaller as WebP, AVIF or JPEG, depending on the visual result you accept.",
        question: "When should I keep the PNG format?",
      },
      {
        answer:
          "Not on the lossless PNG path. Quality controls are hidden when they would be misleading. You can choose another output format if you need lossy compression.",
        question: "Can I lower PNG quality?",
      },
    ],
    guideIntro:
      "The default PNG path removes avoidable encoding overhead without deliberately changing decoded pixels. Transparency and dimensions remain intact unless you choose a conversion or resize.",
    guideTitle: "Optimize PNG structure without inventing a quality slider.",
    howItWorks: [
      {
        body: "Add PNG files. This route accepts PNG content only and verifies the signature rather than trusting the filename.",
        title: "Choose PNG images",
      },
      {
        body: "Keep the original format for lossless optimization, or deliberately choose WebP, AVIF or JPEG when conversion suits the image.",
        title: "Keep or convert",
      },
      {
        body: "The worker optimizes each file and reports whether it became smaller. Download only the results you want to keep.",
        title: "Check actual savings",
      },
    ],
    privacy:
      "PNG pixels and filenames stay in the browser. The lossless optimizer is loaded only when needed and runs in a dedicated worker.",
    relatedHeading: "Related compression tools",
    useCases: [
      "Reduce transparent logos, UI captures and interface assets.",
      "Optimize a batch of PNG exports before committing them to a repository.",
      "Compare lossless PNG against a transparent WebP or AVIF conversion.",
    ],
    why: [
      {
        body: "Alpha data is retained when PNG remains the output, avoiding the accidental solid background common in JPEG-only workflows.",
        title: "Transparency-aware",
      },
      {
        body: "The page does not promise that every already-optimized PNG will shrink. Results show growth as well as savings so you can reject an unhelpful output.",
        title: "Honest about hard files",
      },
    ],
  },
  "/compress-webp": {
    facts: [
      { label: "Input", value: "Static WebP" },
      { label: "Default output", value: "WebP" },
      { label: "Controls", value: "Smart, quality, resize, target size" },
    ],
    faq: [
      {
        answer:
          "No. This tool supports static WebP only and rejects animated WebP files instead of silently flattening their animation.",
        question: "Can I compress animated WebP images?",
      },
      {
        answer:
          "Re-encoding can help when the source was saved at unnecessarily high quality or dimensions, but an already efficient WebP may not become smaller. The result reports either savings or growth.",
        question: "Will every WebP become smaller?",
      },
      {
        answer:
          "Yes. The browser decode and canvas path retains alpha-capable pixels when WebP remains the output. Converting to JPEG requires a background color.",
        question: "Does WebP transparency remain intact?",
      },
    ],
    guideIntro:
      "WebP is already a compressed web format, so useful optimization depends on the source quality and dimensions. This page measures the new result instead of assuming re-encoding always helps.",
    guideTitle: "Recompress static WebP with evidence, not promises.",
    howItWorks: [
      {
        body: "Add static WebP files. Animated containers and other formats are rejected on this focused route.",
        title: "Choose static WebP",
      },
      {
        body: "Use Smart mode or set quality, dimensions and a target size based on where the image will be used.",
        title: "Tune only what matters",
      },
      {
        body: "Inspect the output size and preview. Keep the original whenever the encoded result is larger or visually unsuitable.",
        title: "Keep the better file",
      },
    ],
    privacy:
      "Static WebP files are decoded and re-encoded locally in a worker. Local image bytes and filenames are not sent to the server.",
    relatedHeading: "Related compression tools",
    useCases: [
      "Reduce oversized WebP hero images by bounding their dimensions.",
      "Re-encode high-quality WebP exports for thumbnails or article content.",
      "Target a specific delivery budget and compare the outcome before replacing an asset.",
    ],
    why: [
      {
        body: "The route rejects animation explicitly and keeps transparency on alpha-capable output paths, matching the product's static-format contract.",
        title: "Static behavior is explicit",
      },
      {
        body: "Every result includes original and output bytes, dimensions and saved percentage, including a clear larger-result state.",
        title: "Re-encoding is measured",
      },
    ],
  },
} as const satisfies Record<CompressionRoutePath, CompressionPageContent>;

export function isCompressionRoutePath(path: SeoRoutePath): path is CompressionRoutePath {
  return COMPRESSION_ROUTE_PATHS.includes(path as CompressionRoutePath);
}

export function getCompressionPageContent(path: CompressionRoutePath) {
  return CONTENT[path];
}
