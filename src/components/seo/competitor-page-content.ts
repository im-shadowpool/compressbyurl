import type { SeoRoutePath } from "@/config/seo-routes";

import type { SeoToolPageContent } from "./tool-page-content";

export type CompetitorRoutePath =
  | "/tinypng-alternative"
  | "/squoosh-alternative"
  | "/compressimage-alternative"
  | "/iloveimg-alternative";

export const COMPETITOR_ROUTE_PATHS: readonly CompetitorRoutePath[] = [
  "/tinypng-alternative",
  "/squoosh-alternative",
  "/compressimage-alternative",
  "/iloveimg-alternative",
];

const REVIEW_DATE = "September 14, 2026";

const CONTENT = {
  "/tinypng-alternative": {
    comparison: {
      competitorName: "TinyPNG",
      intro:
        "The practical difference is the processing boundary and workflow, not a promise that one encoder always makes smaller files. TinyPNG also has a separate website analyzer, so webpage scanning is not presented here as exclusive.",
      reviewedOn: REVIEW_DATE,
      rows: [
        {
          competitor:
            "The official FAQ says uploaded images are retained for no more than 48 hours.",
          compressByUrl:
            "Files chosen from your device are decoded and encoded locally in the browser.",
          dimension: "Local-file privacy",
        },
        {
          competitor:
            "The free web tool currently says 20 images up to 5 MB each; conversion is limited to three images.",
          compressByUrl:
            "The browser queue accepts multiple supported files and can package successful results as a ZIP.",
          dimension: "Batch workflow",
        },
        {
          competitor:
            "The web tool lists JXL, AVIF, WebP, JPEG/JPG, PNG and APNG support.",
          compressByUrl:
            "JPEG/JPG, PNG, WebP and static AVIF are supported; animated formats are intentionally excluded.",
          dimension: "Format scope",
        },
        {
          competitor:
            "Tinify advertises a separate Website Image Analyzer and separate Developer API.",
          compressByUrl:
            "One direct public image URL or one public webpage can feed the local optimization workflow.",
          dimension: "URL workflows",
        },
      ],
      sources: [
        { label: "TinyPNG compressor and FAQ", url: "https://tinypng.com/" },
        { label: "TinyPNG Website Image Analyzer", url: "https://tinypng.com/analyzer" },
        { label: "Tinify Developer API", url: "https://tinify.com/developers" },
      ],
    },
    facts: [
      { label: "Best fit", value: "Local files plus direct image and webpage URLs" },
      { label: "Processing", value: "Local for files; bounded fetch for URL modes" },
      { label: "Review date", value: REVIEW_DATE },
    ],
    faq: [
      {
        answer:
          "TinyPNG is a polished choice for straightforward upload compression and supports formats beyond CompressByURL's static four-format scope. Choose based on the workflow and formats you actually need, not a universal quality claim.",
        question: "Is CompressByURL always better than TinyPNG?",
      },
      {
        answer:
          "No. Files selected from your device remain in your browser, but Image URL and Website URL modes need a bounded network fetch to obtain the public resource you request. Compression still runs locally afterward.",
        question: "Are all CompressByURL modes completely offline?",
      },
      {
        answer:
          "TinyPNG currently advertises a separate Website Image Analyzer. CompressByURL connects its single-page discovery results directly to selection, local optimization and replacement-bundle workflows.",
        question: "Does TinyPNG have a website image scanner?",
      },
    ],
    guideIntro:
      "Use the working compressor below, then compare the workflows on verifiable boundaries: where local files are processed, which formats are supported, and whether your job begins with files, one image URL or a webpage URL.",
    guideTitle: "Choose by workflow, not mascot or marketing claim.",
    howItWorks: [
      {
        body: "Add JPEG, PNG, WebP or static AVIF files. The browser validates and previews them without sending local bytes to the server.",
        title: "Start with local files",
      },
      {
        body: "Choose Smart, manual quality, resize, output format or an explicit target-size ceiling.",
        title: "Set the outcome",
      },
      {
        body: "For remote work, switch to Image URL or Website URL; fetched image bytes join the same local compression queue.",
        title: "Use URLs when needed",
      },
    ],
    privacy:
      "This comparison does not claim that one encoder always wins. Test representative images, inspect the output, and keep the original whenever a result is larger or visually unsuitable.",
    relatedHeading: "Try the workflow that matches your source",
    useCases: [
      "Keep local upload bytes on your device during compression.",
      "Compress one public image without downloading it manually first.",
      "Scan a public webpage and optimize selected candidates locally.",
    ],
    why: [
      {
        body: "Local uploads never need the network path. URL modes use constrained fetching only because browsers cannot always read remote resources directly.",
        title: "A clear processing boundary",
      },
      {
        body: "TinyPNG supports additional formats and its own analyzer. CompressByURL concentrates on four static formats and one connected file, image-URL and webpage workflow.",
        title: "Different scope, stated plainly",
      },
    ],
  },
  "/squoosh-alternative": {
    comparison: {
      competitorName: "Squoosh",
      intro:
        "Both products process local images in the browser. The useful choice is between Squoosh's detailed per-image codec workspace and CompressByURL's queue, byte-target and URL-oriented workflow.",
      reviewedOn: REVIEW_DATE,
      rows: [
        {
          competitor:
            "The official repository says image compression happens locally and images are not sent to a server.",
          compressByUrl:
            "Local file decode, encoding, previews, naming and ZIP generation happen in the browser.",
          dimension: "Local processing",
        },
        {
          competitor:
            "The official app is organized around a detailed image comparison and codec settings workspace.",
          compressByUrl:
            "A bounded worker queue processes multiple images with shared settings and ZIP output.",
          dimension: "Working style",
        },
        {
          competitor:
            "The official repository describes numerous formats and exposes codec-specific controls.",
          compressByUrl:
            "Supports JPEG/JPG, PNG, WebP and static AVIF behind one consistent settings model.",
          dimension: "Format controls",
        },
        {
          competitor:
            "This comparison makes no claim that Squoosh lacks an equivalent URL workflow.",
          compressByUrl:
            "Includes direct public image URL intake and bounded single-page image discovery.",
          dimension: "URL workflows",
        },
      ],
      sources: [
        { label: "Squoosh web app", url: "https://squoosh.app/" },
        {
          label: "official Squoosh repository",
          url: "https://github.com/GoogleChromeLabs/squoosh",
        },
        {
          label: "official Squoosh FAQ (last edited 2021)",
          url: "https://github.com/GoogleChromeLabs/squoosh/wiki/FAQ",
        },
      ],
    },
    facts: [
      { label: "Shared strength", value: "Browser-local image compression" },
      { label: "CompressByURL focus", value: "Batch, target-size and URL workflows" },
      { label: "Review date", value: REVIEW_DATE },
    ],
    faq: [
      {
        answer:
          "No. Both keep local image processing in the browser. CompressByURL is aimed at repeatable batch, target-size and URL/page workflows; Squoosh is especially useful when you want to explore detailed codec controls on an image.",
        question: "Is CompressByURL more private than Squoosh?",
      },
      {
        answer:
          "The Squoosh repository says it collects basic visitor information and before/after image-size values through analytics. It also says the image itself is not sent to a server. Review the current privacy disclosures for your needs.",
        question: "Does Squoosh upload the image itself?",
      },
      {
        answer:
          "Use target-size mode when a form or CMS imposes a byte ceiling. CompressByURL searches a bounded quality range and can offer proportional Smart Fit dimension reduction when quality alone cannot meet the target.",
        question: "When is target-size mode useful?",
      },
    ],
    guideIntro:
      "Squoosh is a strong browser-local image lab. CompressByURL is the alternative when the job is a repeatable queue, an explicit byte ceiling, a direct image URL or a webpage image audit.",
    guideTitle: "Keep local processing; change the shape of the workflow.",
    howItWorks: [
      {
        body: "Drop a supported static image or a batch into the shared browser-local queue.",
        title: "Add a file or batch",
      },
      {
        body: "Apply one preset across the queue, or use resize, quality, format and target-size controls.",
        title: "Choose repeatable settings",
      },
      {
        body: "Review measured bytes and dimensions, then download individual results or a ZIP.",
        title: "Inspect and export",
      },
    ],
    privacy:
      "Local files remain on the device in both products according to the reviewed first-party evidence. CompressByURL's network access begins only when you deliberately choose an Image URL or Website URL mode.",
    relatedHeading: "Continue with a focused workflow",
    useCases: [
      "Apply the same settings to several website assets.",
      "Search for the highest tested quality under a fixed KB ceiling.",
      "Move from a webpage image audit into a local optimization queue.",
    ],
    why: [
      {
        body: "The batch queue limits worker concurrency and avoids decoding an entire collection at once.",
        title: "Designed around a queue",
      },
      {
        body: "Squoosh exposes deep codec choices. CompressByURL uses restrained presets first and keeps advanced controls available when needed.",
        title: "Different control philosophy",
      },
    ],
  },
  "/compressimage-alternative": {
    comparison: {
      competitorName: "CompressImage.io",
      intro:
        "These products share several strengths: local processing, batch files, ZIP downloads, resize controls and offline use. CompressByURL mainly differs when the starting point is a public image or webpage URL.",
      reviewedOn: REVIEW_DATE,
      rows: [
        {
          competitor:
            "The official page says JPEG and PNG compression runs in-browser without server uploads.",
          compressByUrl:
            "Local files are decoded and encoded in browser workers and are not uploaded.",
          dimension: "Local processing",
        },
        {
          competitor:
            "The current page shows multi-file intake, ZIP download and claims no count or file-size limit.",
          compressByUrl:
            "Processes a bounded browser queue and packages successful results into a ZIP.",
          dimension: "Batch and ZIP",
        },
        {
          competitor:
            "The current page exposes maximum dimensions, a file suffix and optional WebP conversion.",
          compressByUrl:
            "Exposes fit/exact resize, naming, metadata, quality, target-size and four static output choices.",
          dimension: "Controls",
        },
        {
          competitor:
            "The reviewed page documents its file/drop workflow; this comparison makes no claim about other intake methods.",
          compressByUrl:
            "Accepts one public image URL or scans one public webpage before local optimization.",
          dimension: "URL workflows",
        },
      ],
      sources: [
        {
          label: "CompressImage.io compressor and FAQ",
          url: "https://compressimage.io/",
        },
      ],
    },
    facts: [
      { label: "Shared strengths", value: "Local files, batches, ZIP and resize" },
      { label: "CompressByURL focus", value: "Image URL and webpage workflows" },
      { label: "Review date", value: REVIEW_DATE },
    ],
    faq: [
      {
        answer:
          "Both services say local-file compression runs in the browser. CompressByURL is not claiming a privacy advantage for that upload workflow; its main difference is the connected direct-URL and webpage scanner path.",
        question: "Do both tools process local files privately?",
      },
      {
        answer:
          "CompressImage.io documents JPEG and PNG compression with optional WebP conversion. CompressByURL supports JPEG/JPG, PNG, WebP and static AVIF for local compression and conversion.",
        question: "How does format support differ?",
      },
      {
        answer:
          "After the first visit, CompressImage.io says its cached app can work offline. CompressByURL's local upload mode can process without sending files away, but URL modes necessarily need network access to fetch the requested public resource.",
        question: "Can these tools work offline?",
      },
    ],
    guideIntro:
      "If your input is already on the device, both tools cover a capable local batch workflow. Use CompressByURL when you also want target-size search or need to begin from a direct image URL or a webpage audit.",
    guideTitle: "Acknowledge the overlap; choose on the missing workflow.",
    howItWorks: [
      {
        body: "Choose local files, paste one public image URL, or switch to a bounded one-page website scan.",
        title: "Choose the source",
      },
      {
        body: "Set quality, output, resize, naming, metadata or a byte ceiling before processing.",
        title: "Define the result",
      },
      {
        body: "Compare actual output bytes and dimensions, then download selected files or a ZIP.",
        title: "Keep only useful outputs",
      },
    ],
    privacy:
      "For local files, both products describe browser-local processing. CompressByURL uses a small constrained server layer only when a requested public URL cannot be fetched directly by the browser.",
    relatedHeading: "Explore URL-first image tools",
    useCases: [
      "Bring a direct public image into a local compression queue.",
      "Audit discoverable assets on one public webpage.",
      "Search for a bounded target size across a batch.",
    ],
    why: [
      {
        body: "This comparison does not turn shared features into artificial differences. The reviewed evidence supports local processing, batch, ZIP, resize and offline use for CompressImage.io.",
        title: "Shared strengths stay visible",
      },
      {
        body: "CompressByURL treats local files, a direct image URL and webpage discovery as three entrances to the same optimization system.",
        title: "One connected tool",
      },
    ],
  },
  "/iloveimg-alternative": {
    comparison: {
      competitorName: "iLoveIMG",
      intro:
        "The clearest difference is architectural: iLoveIMG documents a server-processing workflow, while CompressByURL keeps files selected from your device in the browser. iLoveIMG also offers a broader editing suite that this product does not try to replace.",
      reviewedOn: REVIEW_DATE,
      rows: [
        {
          competitor:
            "The official feature page says its servers upload, process and download files, with archives deleted within two hours.",
          compressByUrl:
            "Local file bytes remain on the device through decode, compression and ZIP creation.",
          dimension: "Processing boundary",
        },
        {
          competitor:
            "The compressor lists JPG, PNG, SVG and GIF; iLoveIMG also provides many separate editing tools.",
          compressByUrl:
            "Compression covers JPEG/JPG, PNG, WebP and static AVIF; animated formats and general editing are excluded.",
          dimension: "Product scope",
        },
        {
          competitor:
            "Current Basic pricing lists 30 compressor files and 200 MB per task; Premium lists 120 files and 4 GB.",
          compressByUrl:
            "Batch capacity depends on the user's browser and device; the queue bounds concurrent work.",
          dimension: "Batch limits",
        },
        {
          competitor:
            "The reviewed web workflow integrates Google Drive and Dropbox; no claim is made here about other source modes.",
          compressByUrl:
            "Uses local files, one public image URL, or one public webpage as its three source modes.",
          dimension: "Source options",
        },
      ],
      sources: [
        { label: "iLoveIMG compressor", url: "https://www.iloveimg.com/compress-image" },
        { label: "iLoveIMG features", url: "https://www.iloveimg.com/features" },
        { label: "iLoveIMG pricing", url: "https://www.iloveimg.com/pricing" },
      ],
    },
    facts: [
      { label: "Best fit", value: "Local compression without an editing suite" },
      { label: "URL modes", value: "Direct public image or bounded webpage scan" },
      { label: "Review date", value: REVIEW_DATE },
    ],
    faq: [
      {
        answer:
          "No. iLoveIMG includes a much broader collection of editing and document-adjacent tools. CompressByURL deliberately focuses on static image compression, conversion, resizing, target-size output and URL/page optimization.",
        question: "Does CompressByURL replace every iLoveIMG tool?",
      },
      {
        answer:
          "Files selected from your device stay in your browser in CompressByURL. iLoveIMG's official feature page describes server upload, processing and download, and says archives are automatically removed within two hours.",
        question: "How does file processing differ?",
      },
      {
        answer:
          "The official pricing page currently lists 30 compressor files and 200 MB per task on Basic. Those figures are volatile, so follow the cited pricing source for the latest limits.",
        question: "What are iLoveIMG's current free compression limits?",
      },
    ],
    guideIntro:
      "Choose iLoveIMG for its wider tool suite and cloud integrations. Choose CompressByURL when the priority is local static-image optimization, explicit byte targets, or a connected direct-image and webpage URL workflow.",
    guideTitle: "A focused local compressor, not a general image editor.",
    howItWorks: [
      {
        body: "Add supported local files without uploading them, or deliberately choose one of the public URL modes.",
        title: "Choose the privacy boundary",
      },
      {
        body: "Set compression, resize, format, naming, metadata and target-size behavior in one tool.",
        title: "Configure the output",
      },
      {
        body: "Inspect actual bytes, dimensions and previews, then download individual results or a ZIP.",
        title: "Review before replacing",
      },
    ],
    privacy:
      "Local uploads stay in the browser. Image URL and Website URL modes require a bounded public network fetch, then return the image bytes to the local processing path.",
    relatedHeading: "Try a focused CompressByURL workflow",
    useCases: [
      "Compress sensitive local photos without sending their bytes to the service.",
      "Meet a 100 KB, 200 KB, 500 KB or 1 MB ceiling with bounded search.",
      "Find candidates on one webpage and optimize selected images locally.",
    ],
    why: [
      {
        body: "CompressByURL avoids unrelated editor features so the main compression and URL workflows remain direct.",
        title: "Purposefully narrower",
      },
      {
        body: "The product distinguishes local uploads from requested public-URL fetching instead of describing every mode as offline.",
        title: "Privacy language with boundaries",
      },
    ],
  },
} as const satisfies Record<CompetitorRoutePath, SeoToolPageContent>;

export function isCompetitorRoutePath(path: SeoRoutePath): path is CompetitorRoutePath {
  return COMPETITOR_ROUTE_PATHS.includes(path as CompetitorRoutePath);
}

export function getCompetitorPageContent(path: CompetitorRoutePath) {
  return CONTENT[path];
}
