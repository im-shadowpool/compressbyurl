import type { BlogArticle } from "./blog-types";

// Authored, source-linked editorial content. Illustrative examples are not benchmarks.
export const BLOG_ARTICLES = [
  {
    slug: "fix-pagespeed-improve-image-delivery",
    title: "How to fix “Improve image delivery” in PageSpeed Insights",
    description:
      "Diagnose PageSpeed image delivery warnings by separating oversized pixels, inefficient encoding, and slow loading. Includes a deployment checklist.",
    category: "web-performance",
    image: "performance",
    dek: "A smaller download is useful only if the page actually serves it. Start with the image URL in the report, identify the template that produces it, and fix the delivered variant rather than compressing an unrelated media-library original.",
    summary: [
      "Match the reported URL to the image actually served.",
      "Treat dimensions, encoding, and request timing as separate fixes.",
      "Deploy the replacement and compare the same page under the same conditions.",
    ],
    sections: [
      {
        title: "Read the image delivery finding before changing the file",
        paragraphs: [
          "Chrome’s image delivery insight flags opportunities to reduce image transfer cost. The exact presentation varies with the Lighthouse version behind your report. Open the finding and record each listed resource, its reported size, and the estimated saving. The estimate helps prioritize investigation; it is not a promise that your score will increase by a particular number.",
          "Create a small work list with the page URL, image URL, template location, and proposed change. A product thumbnail and an above-the-fold hero should not receive identical treatment. Note whether the asset is yours to replace. If a widget owns the image, the actionable change may be widget configuration rather than a file export.",
        ],
      },
      {
        title: "Check whether excess dimensions are the main problem",
        paragraphs: [
          "Measure the display slot at the viewport used in the test. Then consider the pixel density you intend to support. In an illustrative layout, a 360 CSS-pixel card on a 2× screen needs roughly 720 source pixels across, not a 3000-pixel camera original. This is a sizing estimate for that layout, not a universal maximum.",
          "Create responsive variants when the same photograph appears in several slots. Reducing every file to the mobile width would make a desktop hero soft; keeping every file at desktop width would waste mobile transfer. Record the intended crop and inspect faces, product edges, and small labels after resizing. A size reduction that cuts out the subject has failed even if the file is tiny.",
        ],
      },
      {
        title: "Compare encoding after you settle the dimensions",
        paragraphs: [
          "Export the same resized pixels into the formats your site can deliver. Compare visual results at the final display size and inspect sensitive details such as gradients, lettering, and transparent edges. Keep the original as a rollback file. A photograph, logo, and screenshot need different tolerances; do not set a blanket quality value and assume every image is acceptable.",
          "For a controlled comparison, hold crop and dimensions constant. If one export changes both dimensions and format, you cannot tell which change explains the byte difference. Calculate savings from the actual candidate files, not from a format’s reputation. An already compressed JPEG can be a better result than a poorly chosen WebP export.",
        ],
      },
      {
        title: "Replace the requested resource, including responsive candidates",
        paragraphs: [
          "Upload the chosen file and update the template or CMS reference. Check src, srcset, picture sources, and any CDN transformation parameters. A page can continue serving an old large candidate even while the visible media-library entry looks correct. Open DevTools on a fresh navigation and inspect the request that was actually made.",
          "Invalidate only the caches that need it, or use a versioned filename. Preserve alternative text and intrinsic dimensions. Test the page as an ordinary visitor rather than only inside an authenticated editor preview. If your production system regenerates derivatives, confirm the generated files retain the intended crop and quality.",
        ],
      },
      {
        title: "Keep request discovery separate from byte savings",
        paragraphs: [
          "A delivery warning and a late hero request can exist on the same page. Use the Network timeline to ask whether the critical image starts promptly or only after scripts and styling run. Compression addresses transfer weight; it cannot by itself move a resource that is discovered late into the initial HTML.",
          "Inspect the rendering template before adding preloads. A plain hero image in server-rendered markup may need only appropriate loading behavior. A CSS background might require a different discovery strategy. Giving every gallery item high priority creates competition. Write down which resource is critical and why, then make one loading change at a time.",
        ],
      },
      {
        title: "Verify the deployed result with a repeatable comparison",
        paragraphs: [
          "Retest the exact page with the same device setting. Record the selected resource, transferred bytes, and visible quality before comparing scores. For example, a worksheet might show an illustrative change from a 900 KB source to a 180 KB candidate; that would be an 80% file reduction, not an 80% speed improvement. Use your own measurements in the worksheet.",
          "Run more than one comparable navigation because network and server variation affect timings. Check both narrow and wide layouts and confirm there are no missing images or layout jumps. Finish by documenting the replacement URL and the template change so the next content upload does not quietly restore the original problem.",
        ],
        bullets: [
          "Find the reported asset with the website scanner.",
          "Resize and compare candidate outputs locally.",
          "Deploy through your own CMS or hosting workflow.",
          "Check the live request and then rerun PageSpeed.",
        ],
      },
    ],
    sources: [
      {
        label: "Chrome: improve image delivery insight",
        url: "https://developer.chrome.com/docs/performance/insights/image-delivery",
      },
    ],
    related: [
      "gtmetrix-properly-size-images",
      "responsive-images-srcset-sizes",
      "image-pagespeed-checklist",
    ],
    faqs: [
      {
        question: "Will this guarantee a score of 100?",
        answer:
          "No. Images are one part of page performance. Server response, scripts, fonts, layout, and test variation also affect the result.",
      },
      {
        question: "Does CompressByURL update my website?",
        answer:
          "No. It helps discover image candidates and create optimized replacement files. You deploy those files and update the references yourself.",
      },
    ],
    imageAlt:
      "Conceptual illustration of a lavender stopwatch and an image travelling toward a browser frame",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/website-image-scanner",
        label: "Scan a public webpage",
        description:
          "Discover static image candidates before inspecting important resources in your browser.",
      },
      {
        path: "/compress-image",
        label: "Compress your images",
        description:
          "Compare measured output files while local image bytes stay in your browser.",
      },
    ],
    seoTitle: "Fix PageSpeed “Improve image delivery”",
  },
  {
    slug: "gtmetrix-properly-size-images",
    title: "Fix GTmetrix “Properly size images” without making photos blurry",
    description:
      "Find oversized image variants in GTmetrix, calculate a sensible pixel width, and deploy responsive replacements without sacrificing desktop clarity.",
    category: "web-performance",
    image: "responsive",
    dek: "Changing a CSS width does not change the file your visitor downloads. Fix the delivered image dimensions, then check which responsive candidate the browser chooses at the viewport that triggered the warning.",
    summary: [
      "Measure the actual slot, not the uploaded file.",
      "Account for pixel density and larger layouts.",
      "Verify srcset and currentSrc after deployment.",
    ],
    sections: [
      {
        title: "Identify the image variant that GTmetrix flagged",
        paragraphs: [
          "GTmetrix describes this finding as a mismatch between delivered image dimensions and the displayed image. The report points you to candidate resources. Copy the listed URL and compare it with the resource on the live page. A CMS may have already produced several sizes while a theme accidentally requests the original.",
          "Record the test viewport and the page component. A warning for a 240-pixel sidebar card should not lead you to shrink the shared image used by a full-width detail page. Your task is to correct that particular request path. Keep the source original available for uses that still need its pixels.",
        ],
      },
      {
        title: "Calculate a useful width for each display slot",
        paragraphs: [
          "Consider a card that occupies 320 CSS pixels on a narrow screen. At a chosen density of 2×, a 640-pixel candidate is a reasonable starting point. If the same design reaches 480 CSS pixels on desktop, a larger candidate may be useful there. These numbers are a worked layout example, not a mandatory sizing recipe.",
          "Measure the slot after the page has settled and after any responsive breakpoint. Container padding, column gaps, and a sidebar all reduce the space actually occupied by the image. Using the whole viewport width for a card inside a three-column grid overestimates its needs. Maintain the crop’s aspect ratio unless the design deliberately uses a different crop.",
        ],
      },
      {
        title: "Make the resize decision before the format decision",
        paragraphs: [
          "Start with the highest-quality source you own. Resize that source once to each intended output width. Repeatedly reducing and recompressing an already small derivative gives you less room to preserve detail. Compare the resized image with the intended view, especially textured products, faces, and fine architectural lines.",
          "Then compare formats at those dimensions. A 640-pixel JPEG and a 2400-pixel WebP do not test the same variable. Keep the larger original outside the public delivery path if it has no page use, but retain it in your own source archive. Do not upscale a small original merely to fill a nominal export size.",
        ],
      },
      {
        title: "Connect the replacement files to the responsive template",
        paragraphs: [
          "Prepare a short set of widths that match the real component rather than a huge list of arbitrary sizes. Supply appropriate image candidates and a sizes expression that describes the display slot. If your framework creates candidates automatically, inspect its generated HTML and make sure your layout information is accurate.",
          "A fixed thumbnail can have a simpler setup than a fluid hero. A mobile crop can require art direction rather than width switching. Keep these concerns distinct in the implementation ticket: width variants answer resolution needs, while crop variants answer composition needs. Both should retain useful alt text and a predictable layout.",
        ],
      },
      {
        title: "Inspect the chosen resource on a fresh page load",
        paragraphs: [
          "Open a fresh navigation at the target viewport and inspect the selected source URL. Resizing an already loaded page is not always a clean test of candidate selection because the browser may keep a previously downloaded larger image. Check the Network entry as well as the element. Test a second layout where the image is larger.",
          "If the original is still requested, trace the relevant template setting. Common suspects include an incomplete srcset, a sizes value that describes the viewport instead of the column, and a theme setting that chooses full resolution. Replace the responsible reference rather than uploading another copy with a confusing filename.",
        ],
      },
      {
        title: "Define success in pixels, bytes, and visual quality",
        paragraphs: [
          "For an illustrative acceptance check, a card could use a 640-pixel asset instead of a 3000-pixel asset while keeping the same 320 CSS-pixel slot. The width reduction is easy to confirm; byte savings depend on the image and encoding. Record the real files rather than assuming a fixed percentage from the pixel count.",
          "Use CompressByURL to create the widths locally, then deploy them through your site’s workflow. Re-run the GTmetrix test under the same settings and inspect both small and large layouts. If the warning clears but the desktop image looks soft, the responsive set is incomplete. Correct that before marking the work done.",
        ],
        table: {
          columns: ["Component", "Example CSS width", "Example 2× candidate"],
          rows: [
            ["Small card", "320px", "640px"],
            ["Article image", "720px", "1440px"],
            [
              "Full-width hero",
              "Measure actual layout",
              "Choose variants after measuring",
            ],
          ],
        },
      },
    ],
    sources: [
      {
        label: "GTmetrix: properly size images",
        url: "https://gtmetrix.com/properly-size-images.html",
      },
    ],
    related: [
      "responsive-images-srcset-sizes",
      "nextjs-image-sizes-too-large",
      "find-oversized-images-devtools",
    ],
    faqs: [
      {
        question: "Is 2× always required?",
        answer:
          "No. It is a starting choice for an example layout. Balance the image’s detail, supported devices, visible quality, and transfer budget.",
      },
      {
        question: "Can CSS max-width fix the downloaded file size?",
        answer:
          "CSS controls presentation. It does not replace the large resource with a smaller encoded file; the delivery markup or image service must choose that file.",
      },
    ],
    imageAlt:
      "Conceptual illustration of matching landscape images in three differently sized frames",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/resize-image",
        label: "Resize an image",
        description:
          "Create a static candidate with dimensions that fit your intended display.",
      },
      {
        path: "/website-image-scanner",
        label: "Scan a public webpage",
        description:
          "Discover static image candidates before inspecting important resources in your browser.",
      },
    ],
    seoTitle: "Fix GTmetrix “Properly size images”",
  },
  {
    slug: "gtmetrix-efficiently-encode-images",
    title: "Fix GTmetrix “Efficiently encode images” with a controlled quality check",
    description:
      "Reduce unnecessary image bytes without confusing compression with resizing. Use a practical export comparison and verify the replacement on your live page.",
    category: "web-performance",
    image: "compression",
    dek: "An encoding warning is a request to investigate wasted bytes, not permission to blur every image. Keep dimensions constant while comparing encodes, choose the least expensive acceptable result, and check that the live page uses it.",
    summary: [
      "Hold dimensions constant during the encoding comparison.",
      "Inspect sensitive detail at the actual display size.",
      "Keep the source original and verify the production replacement.",
    ],
    sections: [
      {
        title: "Separate inefficient encoding from oversized pixels",
        paragraphs: [
          "GTmetrix’s encoding recommendation concerns opportunities to make image files more efficient. Treat it separately from the sizing recommendation even if the same resource appears in both. Record the file URL and the visible use. A high-quality export of a small thumbnail and a gigantic camera original can waste bytes for different reasons.",
          "Fixing dimensions first makes the encoding experiment easier to interpret. Keep a copy of the original and create one resized working source. From that source, compare multiple encoding settings. If you change crop, width, and quality together, you might get a smaller file but lose the ability to explain or reproduce the result.",
        ],
      },
      {
        title: "Choose visual acceptance criteria before moving the quality slider",
        paragraphs: [
          "Decide what the reader needs to see. A product photograph may need readable model markings and smooth reflections. A tutorial screenshot may need exact text edges. A background texture can tolerate more loss than either. Write two or three visible criteria so quality review does not collapse into “looks fine on my laptop.”",
          "Inspect the output at its intended display size, then zoom in on the most sensitive region. A zoomed inspection can reveal damage, but it should not force you to preserve invisible detail at unlimited transfer cost. Include a high-density screen in your check when the image serves one. Keep transparency against the actual page background.",
        ],
      },
      {
        title: "Run a small export experiment from one source",
        paragraphs: [
          "Create an initial candidate, a more conservative candidate, and a more aggressive candidate. Record dimensions, format, bytes, and whether each meets the visual criteria. The labels are for your own experiment, not universal quality numbers. Different encoders interpret quality scales differently, so a matching number across formats is not a fair visual comparison.",
          "Select the smallest candidate that passes. If two files look indistinguishable in the page, the larger one needs a reason to stay. If the smallest produces banding, ringing, or broken text, reject it. Do not treat every available byte reduction as free. A noticeable defect is an editorial or product problem even if an audit estimate looks attractive.",
        ],
      },
      {
        title: "Use lossless paths for images that cannot tolerate artifacts",
        paragraphs: [
          "For screenshots and crisp interface graphics, try a lossless optimization path before a photographic lossy workflow. A large screenshot may also need fewer pixels, but resizing tiny labels can introduce its own blur. Sometimes the right edit is to crop irrelevant blank space or split an unreadable screenshot into focused details.",
          "Keep format constraints in view. JPEG cannot preserve alpha transparency. A transparent asset can be compared in PNG and supported alpha-capable alternatives. If a site requires PNG, use the PNG optimization route rather than forcing a lossy format merely to satisfy a score. The acceptable output is defined by the use, not by the report label.",
        ],
      },
      {
        title: "Deploy the selected bytes and catch stale variants",
        paragraphs: [
          "Upload the chosen export under a versioned filename when your asset workflow allows it. Update the page reference and any responsive candidates. Clear the relevant cache or wait for the normal deployment invalidation. Open the public page, inspect the requested URL, and compare the downloaded bytes to the file you approved.",
          "Check a second page that shares the component. A CMS may regenerate images or a CDN may add its own transformation. Keep a deployment note with the original filename and approved settings so a later upload can follow the same standard. Do not silently overwrite a source used by print or another larger display context.",
        ],
      },
      {
        title: "Measure savings without claiming a matching speed increase",
        paragraphs: [
          "Suppose an illustrative 400 KB file becomes a 160 KB candidate at the same dimensions. That is a 60% file-size reduction. It says nothing by itself about the page’s timing improvement: the image may be offscreen, cached, or blocked behind another bottleneck. Record the real byte change alongside the actual page measurements.",
          "Use the browser compressor to compare candidates locally, download the accepted result, and rerun the same GTmetrix configuration after deployment. Finish when the right file is served and the image passes your visual acceptance check. If the audit remains, inspect the exact remaining URL rather than reducing quality blindly again.",
        ],
        bullets: [
          "Preserve an untouched source.",
          "Compare identical dimensions and crop.",
          "Reject artifacts that affect the image’s purpose.",
          "Confirm the delivered file after publishing.",
        ],
      },
    ],
    sources: [
      {
        label: "GTmetrix: efficiently encode images",
        url: "https://gtmetrix.com/efficiently-encode-images.html",
      },
    ],
    related: [
      "compress-png-screenshots-sharp-text",
      "webp-bigger-than-jpeg",
      "gtmetrix-properly-size-images",
    ],
    faqs: [
      {
        question: "What quality number should I use?",
        answer:
          "There is no universal setting. Start with your tool’s default, compare actual outputs, and choose the smallest file that meets your visual requirements.",
      },
      {
        question: "Will repeated JPEG compression improve the source?",
        answer:
          "No. Work from an original when possible. Repeated lossy exports can accumulate artifacts without recovering any lost detail.",
      },
    ],
    imageAlt:
      "Conceptual illustration of a ceramic press beside large and compact image tiles",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/compress-image",
        label: "Compress your images",
        description:
          "Compare measured output files while local image bytes stay in your browser.",
      },
      {
        path: "/compress-png",
        label: "Optimize a PNG",
        description: "Prepare a PNG candidate and inspect text and transparent edges.",
      },
    ],
    seoTitle: "Fix GTmetrix “Efficiently encode images”",
  },
  {
    slug: "fix-lcp-image-resource-load-delay",
    title: "Fix LCP image resource load delay before compressing again",
    description:
      "Find why your hero image starts late, separate LCP timing stages, and remove discovery delays without preloading every image on the page.",
    category: "web-performance",
    image: "performance",
    dek: "If the browser waits before requesting your hero, a smaller file fixes only part of the wait. Find the actual Largest Contentful Paint element and trace when its resource becomes discoverable.",
    summary: [
      "Identify the measured LCP element, not just the biggest file.",
      "Compare request discovery and transfer time separately.",
      "Make the critical resource available early without promoting every image.",
    ],
    sections: [
      {
        title: "Identify the LCP element in the test you are fixing",
        paragraphs: [
          "The visual hero is a useful suspect, but it is not proof. Inspect the reported Largest Contentful Paint element or a browser performance trace. The selected element can differ across viewports and loads. If the measured element is text, re-encoding a background photograph may not address the timing you are investigating.",
          "Save the exact page URL, viewport, and relevant trace. Note the image source if the element is an image. Reproduce the same layout before making changes. A desktop banner and a mobile headline can create different critical paths. Describe the problem as “this resource starts late in this view,” not “all images need optimization.”",
        ],
      },
      {
        title: "Break LCP into a timeline rather than a single score",
        paragraphs: [
          "web.dev separates LCP into server response, resource load delay, resource load duration, and element render delay. That model helps explain why an image can download quickly and still appear late. Use it to locate the stage that dominates your test rather than assuming the file transfer is always responsible.",
          "Make a simple timeline from your own trace. In an illustrative case, a request starting long after HTML arrives suggests a discovery or priority issue. A prompt request with a long transfer suggests delivery weight or network limits. A completed request followed by a late paint points to rendering work. These are hypotheses to confirm, not fixed rules from a single run.",
        ],
      },
      {
        title: "Check whether the image exists in the initial page markup",
        paragraphs: [
          "Inspect the server-delivered page or document response. Does it contain the critical image and its resource candidates, or does a script insert them later? Follow the responsible component. A loading skeleton, client-only data fetch, or carousel initialization can delay the moment when the browser learns the resource URL.",
          "Where the product allows it, render the first visible image with its real source in the initial HTML. Preserve an accessible fallback if data is genuinely unavailable. Do not convert useful progressive content into a blocking client sequence merely for a visual effect. Record the request start again after the template change.",
        ],
      },
      {
        title: "Give one critical image a deliberate loading policy",
        paragraphs: [
          "For the confirmed image, inspect whether lazy loading is delaying its request. Use normal eager loading for a critical first-view image and consider a high fetch-priority hint when warranted. Keep offscreen editorial and gallery images lazy. The decision should follow visibility and measured importance, not whether a file happens to be large.",
          "Do not set every resource to high priority. That erases the distinction you are trying to communicate and can increase competition. Preload is useful when the browser otherwise discovers a critical asset late, but mismatched preload and responsive URLs can waste requests. Compare the actual Network requests after each loading change.",
        ],
      },
      {
        title: "Inspect rendering delays that compression cannot remove",
        paragraphs: [
          "If the file has arrived before the element paints, investigate what prevents presentation. A script might keep the hero hidden, a main-thread task might delay rendering, or a style dependency might block the page. Use the performance trace to see the surrounding activity. Re-exporting the same image cannot directly fix those conditions.",
          "Review first-view animations with particular care. A hero that starts at opacity zero or waits for an interaction can make visible content dependent on JavaScript. Make the content useful by default. Remove one suspected gate at a time in a local environment and compare the trace, then implement the smallest supported change.",
        ],
      },
      {
        title: "Finish with bytes, timing, and a checked live template",
        paragraphs: [
          "Once discovery and presentation are sound, compare resized or re-encoded image candidates. Do not throw away a useful compression improvement just because it is not the whole fix. Your work item can include both a template correction and an asset replacement, with separate evidence for each.",
          "Use a before/after worksheet containing the measured LCP element, chosen source URL, request start, transfer size, and visible paint timing. Repeat the same test settings and compare several runs. Keep the change only if it preserves the intended layout and produces the expected request behavior. Real-user data may need time to reflect the deployed result.",
        ],
        table: {
          columns: ["Trace observation", "Investigate first"],
          rows: [
            ["Request starts late", "Markup discovery and loading policy"],
            ["Transfer is large", "Dimensions, format, and encoding"],
            ["File arrives but paint waits", "Main-thread work and visibility gates"],
          ],
        },
      },
    ],
    sources: [
      {
        label: "web.dev: LCP timing and optimization",
        url: "https://web.dev/articles/optimize-lcp",
      },
    ],
    related: [
      "lcp-image-lazy-loading",
      "css-background-image-lcp",
      "pagespeed-vs-gtmetrix-images",
    ],
    faqs: [
      {
        question: "Can the website scanner measure my LCP?",
        answer:
          "No. Static image discovery helps create an asset inventory. LCP and actual request timing need a rendered browser or an appropriate performance report.",
      },
      {
        question: "Should I preload all hero variants?",
        answer:
          "No. Start with the resource actually required by the layout and check responsive selection. Extra preloads can consume bandwidth without helping the measured element.",
      },
    ],
    imageAlt:
      "Conceptual illustration of a lavender stopwatch and an image travelling toward a browser frame",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/website-image-scanner",
        label: "Scan a public webpage",
        description:
          "Discover static image candidates before inspecting important resources in your browser.",
      },
      {
        path: "/compress-image",
        label: "Compress your images",
        description:
          "Compare measured output files while local image bytes stay in your browser.",
      },
    ],
    seoTitle: "Fix LCP image resource load delay",
  },
  {
    slug: "image-pagespeed-checklist",
    title: "An image-focused PageSpeed checklist for developers",
    description:
      "Audit website images in a useful order: inventory, dimensions, format, loading, layout stability, and deployment verification. Includes an evidence worksheet.",
    category: "website-audits",
    image: "audit",
    dek: "An image audit should end with a short list of changes you can deploy. Work from the visible page and its requests, then connect each finding to a specific asset or template owner.",
    summary: [
      "Build an inventory before optimizing a batch.",
      "Prioritize first-view images and repeated oversized assets.",
      "Verify deployment instead of stopping at a downloaded ZIP.",
    ],
    sections: [
      {
        title: "Capture a baseline with the page and device settings",
        paragraphs: [
          "Record the tested URL, viewport, network conditions, and report date. Google distinguishes lab measurements from field data in PageSpeed Insights. Use a lab run to investigate a repeatable problem and use available field data to understand the visitor experience. Do not compare two unrelated environments as if they were a controlled experiment.",
          "Save a screenshot of the first view and identify likely critical images. Note banners, thumbnails, decorative backgrounds, and third-party widgets separately. A single URL can expose several responsive layouts. Start with the layout your visitors actually use or the one flagged by the report, then add the other important layouts to the acceptance check.",
        ],
      },
      {
        title: "Create an image inventory with actionable ownership",
        paragraphs: [
          "List the resource URL, approximate transfer size, intrinsic dimensions when known, and the component that references it. Add whether you control the file or only the integration. A static scanner is useful for finding HTML image candidates quickly, but confirm actual browser requests for script-created content and responsive selection.",
          "Deduplicate repeated URLs so the work list does not count the same delivered file several times. Keep intentionally different crops separate. Mark unknown values as unknown rather than zero. If a resource cannot be fetched by the scanner, preserve that limitation and inspect it in your own browser instead of assuming it has no performance cost.",
        ],
      },
      {
        title: "Prioritize fixes by page use rather than file size alone",
        paragraphs: [
          "A heavy above-the-fold image is a different task from a heavy image far below the fold. A small asset repeated across hundreds of templates can be a different priority again. Start with critical visibility, then unnecessary dimensions, then encoding opportunities. Consider whether the asset is reused and how easy the responsible template is to change.",
          "Use a simple queue with “critical image,” “repeated card,” and “other content” groups. These groups are planning aids, not measured severity scores. A third-party file may require removing or configuring a widget. A first-party file may need only an export and a template reference. Make the next action explicit for each entry.",
        ],
      },
      {
        title: "Check dimensions, quality, loading, and reserved space",
        paragraphs: [
          "For each owned asset, measure its display slot and choose useful output widths. Compare quality and formats from the same source. Inspect the first-view request timing. Check whether the image area stays stable while loading. This prevents one fix, such as replacing a file, from hiding another problem, such as delayed discovery.",
          "Keep a separate checkbox for meaningful alternative text. It is an accessibility task rather than a byte-saving technique, but a replacement should not discard it. Check transparency and crop as well. An audit that reduces transfer while breaking labels, visible subjects, or layout has not improved the page.",
        ],
        bullets: [
          "Confirm the real selected source at target viewports.",
          "Avoid forcing a mobile width onto a desktop hero.",
          "Keep critical images discoverable without unnecessary client waits.",
          "Reserve a layout area before image download completes.",
        ],
      },
      {
        title: "Create and deploy a replacement bundle deliberately",
        paragraphs: [
          "Select a manageable group of images and generate replacements locally. Keep originals, name outputs so you can map them to the source assets, and inspect the chosen results. A ZIP is a delivery artifact for your own deployment workflow, not an automatic website update. Include a small mapping note with the template or media entry that needs changing.",
          "Deploy one representative page before rolling the same transformation across a whole theme. Check responsive candidates and caches. If the site regenerates derivatives, inspect those generated files rather than only the file you uploaded. Preserve a rollback path for a visual defect or incorrect crop discovered on a larger display.",
        ],
      },
      {
        title: "Use an evidence worksheet for the final check",
        paragraphs: [
          "Capture the same page after deployment. Record the actual requested replacement, transferred bytes, dimensions, and visual acceptance. Compare lab runs under matching settings. Do not claim that a lower file size proves a ranking gain or that a single better score proves the visitor experience is permanently fixed.",
          "Keep the worksheet as a reusable publishing standard. For future uploads, editors can check the intended slot and source quality before a large file reaches production. Review new report findings against this baseline instead of endlessly recompressing old files. Begin the next audit with the remaining largest actionable issue, not with a fresh batch of unprioritized downloads.",
        ],
        table: {
          columns: ["Evidence", "Before", "After"],
          rows: [
            ["Selected source URL", "Record actual URL", "Record replacement URL"],
            [
              "Transferred image bytes",
              "Measure in browser",
              "Measure under same conditions",
            ],
            [
              "Display width and crop",
              "Record target layout",
              "Confirm unchanged intent",
            ],
            ["Timing and stability", "Save trace or report", "Compare repeatable runs"],
          ],
        },
      },
    ],
    sources: [
      {
        label: "Google: PageSpeed Insights lab and field data",
        url: "https://developers.google.com/speed/docs/insights/v5/about",
      },
    ],
    related: [
      "fix-pagespeed-improve-image-delivery",
      "website-image-scanner-limitations",
      "find-large-images-on-a-website",
    ],
    faqs: [
      {
        question: "Do I need to optimize every image at once?",
        answer:
          "No. A prioritized first batch is easier to deploy and verify. Start with critical or repeated owned assets, then work through the remaining inventory.",
      },
      {
        question: "Does a good PageSpeed score guarantee AdSense approval?",
        answer:
          "No. Performance is one part of site quality. AdSense also reviews content, access, and policy compliance, and Google makes the approval decision.",
      },
    ],
    imageAlt:
      "Conceptual illustration of a magnifying lens inspecting landscape image tiles",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/website-image-scanner",
        label: "Scan a public webpage",
        description:
          "Discover static image candidates before inspecting important resources in your browser.",
      },
      {
        path: "/website-image-optimizer",
        label: "Prepare a replacement bundle",
        description:
          "Select discovered candidates and optimize fetched image bytes locally.",
      },
    ],
    seoTitle: "Image optimization checklist for PageSpeed",
  },
  {
    slug: "responsive-images-srcset-sizes",
    title: "Responsive images: get srcset and sizes right for your layout",
    description:
      "Build responsive image variants using real slot widths, pixel density, and browser-selected sources. Includes a complete HTML card example.",
    category: "developer-guides",
    image: "responsive",
    dek: "Responsive images begin with a layout question: how wide will this image actually be? Exporting three files is only half the job. The markup must describe the slot accurately enough for the browser to choose among them.",
    summary: [
      "Width descriptors describe files; sizes describes the display slot.",
      "Use the real column width, not always the viewport.",
      "Check currentSrc on fresh loads at each important breakpoint.",
    ],
    sections: [
      {
        title: "Separate image resolution from image composition",
        paragraphs: [
          "MDN distinguishes resolution switching from art direction. Resolution switching presents the same composition at different pixel dimensions. Art direction changes the crop for a different layout. Decide which problem you have before preparing files, because making a photograph smaller cannot repair a crop that hides the subject on mobile.",
          "For an article card, width variants of the same crop are often sufficient. For a landscape banner with a person near the edge, a narrower layout might need a deliberately composed alternate crop. Document that distinction in the asset names. Keep alternative text about the content rather than about the crop or file format.",
        ],
      },
      {
        title: "Measure the image slot at the layout breakpoints",
        paragraphs: [
          "In a worked example, a card uses the viewport minus 32 pixels of gutters on narrow screens and occupies a 360-pixel slot on desktop. Its sizes expression should describe those two situations. A value of 100vw would overstate the desktop requirement because the card does not stretch across the screen.",
          "Test the slot in the actual component, including padding, gaps, and max-width. A design sketch is a starting assumption; computed layout is the acceptance evidence. If a sidebar opens or the card appears in another container, the expression may need to describe that layout too. Avoid solving one route while silently overfetching on another.",
        ],
      },
      {
        title: "Create a small candidate set from a good original",
        paragraphs: [
          "Export candidate widths that cover the relevant slots and selected density targets. For the example card, 360, 720, and 1080 pixels can provide useful options. Each w descriptor must correspond to the actual pixel width of its file. Do not name a 720-pixel file as 1080w to force a selection.",
          "Use the same composition and aspect ratio for this resolution-switching set. Work from the original rather than from a succession of compressed derivatives. Compare bytes and quality after resizing. More candidates mean more files to maintain, so add another width because it serves a real gap, not because a template generator offers ten options.",
        ],
      },
      {
        title: "Connect files and slot hints in complete HTML",
        paragraphs: [
          "The following example assumes you have exported three real files at the stated widths and a desktop card with a 360-pixel slot. The source paths are illustrative assets to replace in your own project. The width and height describe a 3:2 ratio; CSS makes the displayed image follow its containing card.",
          "Keep the fallback src useful. Do not assume srcset is a CSS rule that forces one file at a breakpoint. It offers candidates and sizing information to the browser. For a genuinely different mobile crop, use picture with an appropriate media condition rather than mixing inconsistent crops into a single width-descriptor set.",
        ],
        code: {
          language: "html",
          caption:
            "Example for a fluid mobile card and a fixed 360px desktop slot. Export these assets before using the markup.",
          text: '<img\n  src="/images/card-720.webp"\n  srcset="/images/card-360.webp 360w,\n          /images/card-720.webp 720w,\n          /images/card-1080.webp 1080w"\n  sizes="(max-width: 600px) calc(100vw - 32px), 360px"\n  width="720" height="480"\n  loading="lazy" decoding="async"\n  alt="Mountain lake below a snow-covered ridge"\n  style="display:block;width:100%;height:auto"\n>',
        },
      },
      {
        title: "Verify the selected source and the visual result",
        paragraphs: [
          "Open a fresh load at a narrow viewport and inspect the image’s currentSrc and Network request. Repeat at the desktop layout and a relevant high-density setting. A resized existing session can retain a previously downloaded larger candidate, so it is weaker evidence than a fresh controlled navigation.",
          "Check the actual content as well as the selected filename. An output can have the expected width and still contain artifacts or an incorrect crop. If the browser selects an unexpectedly large candidate, inspect sizes first, then verify the file widths and component geometry. Keep the findings attached to the relevant layout rather than adding another random candidate.",
        ],
      },
      {
        title: "Maintain variants as part of the publishing workflow",
        paragraphs: [
          "Use a predictable naming scheme that distinguishes subject, crop, and width. Keep an untouched original in your source workflow. When the image changes, regenerate the full responsive set together so different widths do not accidentally show different revisions of the photograph.",
          "CompressByURL can prepare static resized variants locally, but it does not write your responsive HTML or change your hosting configuration. Download the approved files, update the component, and verify a public page. The finished result is a working delivery set with readable content, not merely a folder full of small images.",
        ],
        table: {
          columns: ["Information", "Describes"],
          rows: [
            ["720w in srcset", "Actual width of that candidate file"],
            ["360px in sizes", "Expected CSS display slot"],
            ["width and height attributes", "Intrinsic aspect ratio for layout"],
            ["CSS width", "Displayed geometry of the element"],
          ],
        },
      },
    ],
    sources: [
      {
        label: "MDN: responsive images",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images",
      },
    ],
    related: [
      "nextjs-image-sizes-too-large",
      "gtmetrix-properly-size-images",
      "find-oversized-images-devtools",
    ],
    faqs: [
      {
        question: "Should sizes always be 100vw?",
        answer:
          "Only when the image really occupies the viewport width. Cards, article columns, and sidebar images usually need a more accurate description.",
      },
      {
        question: "Does srcset automatically crop a mobile image?",
        answer:
          "No. Width candidates handle resolution selection. Use deliberately prepared crops and picture media conditions when composition needs to change.",
      },
    ],
    imageAlt:
      "Conceptual illustration of matching landscape images in three differently sized frames",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/resize-image",
        label: "Resize an image",
        description:
          "Create a static candidate with dimensions that fit your intended display.",
      },
      {
        path: "/image-converter",
        label: "Compare image formats",
        description:
          "Export a supported static format and inspect quality and actual bytes.",
      },
    ],
    seoTitle: "Responsive images: srcset and sizes guide",
  },
  {
    slug: "nextjs-image-sizes-too-large",
    title: "Next.js Image serving files that are too large? Check sizes first",
    description:
      "Diagnose oversized Next.js Image downloads by matching sizes to grid columns, inspecting generated srcset, and separating source assets from delivery variants.",
    category: "developer-guides",
    image: "responsive",
    dek: "The Image component cannot infer every layout decision from your CSS. If your card occupies one third of a desktop container, tell it about that slot before blaming the source file or changing every quality setting.",
    summary: [
      "Describe the actual layout in the sizes prop.",
      "Inspect the generated request rather than the original file alone.",
      "Fix remote allowlists and loading behavior separately from sizing.",
    ],
    sections: [
      {
        title: "Find the request produced by your Image component",
        paragraphs: [
          "Inspect the rendered image on the exact route that overfetches. Record its selected URL, the requested width if your optimizer exposes one, and its displayed width. The source asset can be large without every visitor receiving the original; conversely, an optimized URL can still request a wastefully large variant.",
          "Check whether the project uses the default optimizer, a custom loader, or unoptimized delivery. Those routes can behave differently. Do not compare the image file in your repository to the Network transfer and assume they are the same resource. Capture the route, viewport, and selected candidate as your starting evidence.",
        ],
      },
      {
        title: "Match sizes to the grid rather than the viewport",
        paragraphs: [
          "The Next.js Image documentation explains how sizes influences responsive candidate generation and selection. For a fluid image, supply a sizes expression that follows your actual layout. Without a correct hint, a grid image can be treated as if it needs much more horizontal space than its column provides.",
          "In an illustrative design, the image occupies nearly the full screen on mobile, half the available width on a tablet, and a fixed slot inside a capped desktop grid. Translate those conditions into the prop. Include gutters and the maximum container width where relevant. A blanket 33vw is still too large on a very wide screen when the container has stopped growing.",
        ],
      },
      {
        title: "Use fill only when the parent owns the geometry",
        paragraphs: [
          "A fill image needs a containing layout that establishes its area. Give that parent deliberate dimensions or an aspect ratio and appropriate positioning. Object-fit controls whether the content is cropped or fitted within that area. It does not determine how many pixels should be downloaded.",
          "If the source dimensions are known and the layout is straightforward, explicit width and height can make intent clearer. Choose the implementation that fits the component rather than treating fill as a universal performance fix. In both cases, verify layout stability and the size hint. A correct ratio and a correct delivery width solve different problems.",
        ],
      },
      {
        title: "Configure remote sources narrowly and independently",
        paragraphs: [
          "For remote images, check your project’s allowed image source patterns against the current Next.js documentation. An image optimization allowlist is a security configuration, not a remedy for an oversized card. Do not broaden it to all hosts because one CMS image failed to load.",
          "Keep the expected hostname, path, and any query constraints as specific as your delivery system permits. If the public URL changes by CMS environment, document that variation. CompressByURL’s separate public-image intake does not configure your Next.js optimizer. Keep the application’s delivery rules and the local compression workflow as separate work items.",
        ],
      },
      {
        title: "Check the candidate under fresh responsive loads",
        paragraphs: [
          "After correcting sizes, load the page freshly at each important breakpoint. Read the generated srcset and currentSrc and check the corresponding Network request. The browser can keep a larger already-loaded image during resizing, so a session that began at desktop width is a poor way to judge a cold mobile request.",
          "Inspect visible detail, not just request width. If the expected smaller candidate looks soft, revisit the density target or source quality. If the expected larger candidate is still much heavier than necessary, compare encodes separately. Avoid changing quality at the same time as sizes during the first experiment so you can identify which correction caused the result.",
        ],
      },
      {
        title: "Reduce source weight without replacing the delivery system",
        paragraphs: [
          "Prepare a sensible original or master asset before publishing it to your CMS. Avoid uploading an enormous print file for a small editorial slot. Keep enough pixels for the largest real layout, then let the established delivery path produce the responsive candidates. The local resize tool can help create that master.",
          "Finish with an acceptance note containing the component’s layout assumptions, its sizes expression, selected candidate widths, and a visual check. Retest pages that reuse the component. A component-level sizing correction can be more durable than compressing each new upload more aggressively to compensate for the same inaccurate hint.",
        ],
        table: {
          columns: ["Symptom", "Check"],
          rows: [
            ["Grid card downloads a hero-sized file", "sizes and the capped grid width"],
            ["fill image has no stable area", "Parent geometry and positioning"],
            ["Remote image is rejected", "Allowed remote source patterns"],
            ["Correct width but large transfer", "Source quality and encoding"],
          ],
        },
      },
    ],
    sources: [
      {
        label: "Next.js: Image component reference",
        url: "https://nextjs.org/docs/app/api-reference/components/image",
      },
    ],
    related: [
      "responsive-images-srcset-sizes",
      "images-cumulative-layout-shift",
      "webp-bigger-than-jpeg",
    ],
    faqs: [
      {
        question: "Does using Image guarantee small downloads?",
        answer:
          "No. Source quality, loader behavior, and layout hints still matter. Inspect the actual delivered resource.",
      },
      {
        question: "Should every image be preloaded?",
        answer:
          "No. Use loading controls for the confirmed critical image. Offscreen cards should not all compete with first-view content.",
      },
    ],
    imageAlt:
      "Conceptual illustration of matching landscape images in three differently sized frames",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/resize-image",
        label: "Resize an image",
        description:
          "Create a static candidate with dimensions that fit your intended display.",
      },
      {
        path: "/compress-image",
        label: "Compress your images",
        description:
          "Compare measured output files while local image bytes stay in your browser.",
      },
    ],
    seoTitle: "Fix oversized Next.js Image downloads",
  },
  {
    slug: "lcp-image-lazy-loading",
    title: "Why lazy loading your LCP image can make the page slower",
    description:
      "Choose an eager policy for critical first-view images and lazy loading for offscreen content. Diagnose hero delays without disabling lazy loading site-wide.",
    category: "web-performance",
    image: "performance",
    dek: "Lazy loading is useful when the image can wait. Your first visible hero often cannot. Identify the critical element, then give visible and offscreen images different policies.",
    summary: [
      "Confirm which image is critical at the target viewport.",
      "Keep below-the-fold images lazy.",
      "Check templates that add hidden placeholders or client waits.",
    ],
    sections: [
      {
        title: "Ask whether this image can wait until later",
        paragraphs: [
          "Native lazy loading defers eligible image fetching until the browser considers the resource near enough to the viewport. web.dev recommends keeping likely first-view and LCP images out of that delayed path. The key is the image’s role in the page, not whether its file is large.",
          "A page can contain a hero, visible cards, and an offscreen gallery. These do not need one global loading rule. Mark the intended initial experience in your design review: what should be visible without scrolling, and which image contributes most to that experience? Use a measured LCP report to confirm the critical element.",
        ],
      },
      {
        title: "Inspect how the hero is rendered, not just its attribute",
        paragraphs: [
          "Check whether the initial document contains the real src and srcset. A script that uses data-src or inserts the image after initialization can create a delay even if the final DOM eventually shows loading eager. Review the code path that first supplies the URL.",
          "A carousel may keep its first slide behind a hydration step, and a CMS plugin may apply the same lazy transformation to every image. Find that responsible layer before changing files. Write down the resource-discovery condition so the fix survives the next theme update or asset replacement.",
        ],
      },
      {
        title: "Use a deliberately eager policy for the critical image",
        paragraphs: [
          "For a confirmed critical image already in the markup, use normal eager behavior rather than lazy. Consider a high fetch-priority hint when the image is competing with other requests. The hint does not create a resource that is absent from the document, and it does not remove a later rendering gate.",
          "The example below illustrates an ordinary image with reserved geometry. Replace the asset path and dimensions with your own exported image. A framework may expose equivalent properties with different casing or version-specific behavior; use its current documentation instead of pasting HTML attributes into a component without checking.",
        ],
        code: {
          language: "html",
          caption:
            "Example for a confirmed first-view hero. The path and dimensions must match your own asset.",
          text: '<img\n  src="/images/hero.webp"\n  width="1440" height="960"\n  loading="eager" fetchpriority="high"\n  alt="Mountain lake below a snow-covered ridge"\n  style="display:block;width:100%;height:auto"\n>',
        },
      },
      {
        title: "Keep deferred loading for the images that can wait",
        paragraphs: [
          "Below-the-fold illustrations, long article image sequences, and gallery items can retain lazy loading. Give them reserved dimensions so layout does not jump as they appear. Do not eagerly request a large hidden gallery just because one hero needed a different policy.",
          "Also inspect carousels that place many slides in the document. A slide can be hidden visually yet still produce a request. The first visible slide and the next twenty slides have different usefulness at navigation time. Check request behavior rather than assuming a CSS hiding rule automatically prevents downloads.",
        ],
      },
      {
        title: "Avoid layering several mechanisms without evidence",
        paragraphs: [
          "A preload, eager loading, and a priority hint can be useful in different situations, but adding all of them without tracing the request can make the page harder to reason about. If the correct resource already starts promptly, another preload may not solve the observed delay.",
          "Responsive preloads need to line up with the resource the browser actually uses. Check for duplicate requests or a downloaded desktop asset on mobile. Remove unnecessary hints once the measured behavior is correct. A small explicit policy is easier to maintain than a growing collection of exceptions copied from several performance tutorials.",
        ],
      },
      {
        title: "Verify discovery, transfer, and paint independently",
        paragraphs: [
          "Compare the same viewport before and after the policy change. Look for the critical request to start at the expected point in navigation. Confirm that the visible image still has the correct crop and a stable layout. Then inspect whether presentation remains delayed by scripting or styles.",
          "Compress the asset after the loading path is understood if its bytes remain excessive. Your final evidence should include the measured critical image, selected URL, loading policy, and trace. Do not infer a fixed LCP improvement from a tutorial example. Keep the offscreen gallery check in the acceptance list so the hero fix does not increase unrelated initial transfer.",
        ],
      },
    ],
    sources: [
      {
        label: "web.dev: browser-level image lazy loading",
        url: "https://web.dev/articles/browser-level-image-lazy-loading",
      },
    ],
    related: [
      "fix-lcp-image-resource-load-delay",
      "css-background-image-lcp",
      "image-pagespeed-checklist",
    ],
    faqs: [
      {
        question: "Should I remove lazy loading everywhere?",
        answer:
          "No. Separate critical first-view images from offscreen content and verify each policy in the actual layout.",
      },
      {
        question: "Does high priority cancel lazy loading?",
        answer:
          "Treat priority and loading as separate controls. A deferred resource still depends on its loading conditions; verify the resulting request timeline.",
      },
    ],
    imageAlt:
      "Conceptual illustration of a lavender stopwatch and an image travelling toward a browser frame",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/website-image-scanner",
        label: "Scan a public webpage",
        description:
          "Discover static image candidates before inspecting important resources in your browser.",
      },
      {
        path: "/compress-image",
        label: "Compress your images",
        description:
          "Compare measured output files while local image bytes stay in your browser.",
      },
    ],
    seoTitle: "Fix lazy loading on your LCP image",
  },
  {
    slug: "images-cumulative-layout-shift",
    title: "Stop images from causing Cumulative Layout Shift",
    description:
      "Reserve image space with correct width, height, and aspect ratio. Fix shifting cards and article images without relying on smaller files alone.",
    category: "developer-guides",
    image: "responsive",
    dek: "A faster image can still move the paragraph beneath it. Give the layout enough geometry before the image arrives, then check the actual shift instead of treating file size as a layout fix.",
    summary: [
      "Reserve the intended image ratio before download.",
      "Keep responsive crops and container geometry consistent.",
      "Inspect post-load shifts as well as the first screenshot.",
    ],
    sections: [
      {
        title: "Identify whether the image actually caused the shift",
        paragraphs: [
          "Use a performance trace or layout-shift view to locate the moving elements. web.dev discusses images without dimensions as a common source of instability. The element that moves is not necessarily the cause: a paragraph can be displaced by an expanding image above it.",
          "Record the page region, the image’s initial area, and its final area. Check whether the change follows image download, a script, a font, or an ad slot. Compressing an unrelated asset will not help. A clear reproduction makes it easier to assign the fix to the image component, the surrounding layout, or another resource.",
        ],
      },
      {
        title: "Use width and height to communicate the intrinsic ratio",
        paragraphs: [
          "Supply width and height that reflect the image’s actual proportions. These values are useful even when CSS makes the image fluid. In an illustrative 1200 × 800 image, the 3:2 relationship is the important information for the layout; the displayed width can still follow a narrower article column.",
          "Do not choose arbitrary dimensions merely to quiet an audit. Incorrect ratios can reserve the wrong space or distort content. If the design deliberately crops to a different frame, define that frame explicitly. Keep the asset’s intrinsic ratio and the display container’s crop policy understandable to the next developer.",
        ],
      },
      {
        title: "Give cropped cards a stable container",
        paragraphs: [
          "For a card with a fixed display ratio, reserve that area in the parent and fit the image within it. The following CSS illustrates a 3:2 crop. It assumes the parent class is applied to the image frame and that the child is the image; it is not a substitute for meaningful alternative text or correct source candidates.",
          "Choose object-fit cover when cropping is intended and contain when all image content must remain visible. A tutorial screenshot with edge labels may be better fitted than cropped. Check real content after the change. Stable geometry that hides the information the article discusses is the wrong solution.",
        ],
        code: {
          language: "css",
          caption:
            "Example for a deliberately cropped card frame. Use a ratio that matches the component design.",
          text: ".image-frame {\n  aspect-ratio: 3 / 2;\n  overflow: hidden;\n}\n.image-frame img {\n  display: block;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}",
        },
      },
      {
        title: "Handle alternate mobile crops deliberately",
        paragraphs: [
          "If a mobile crop has different proportions, the reserved layout needs to match that choice. Test the picture sources and their media conditions together with the frame styling. A desktop ratio that persists on mobile can leave unexpected empty space or cause a later adjustment.",
          "Prefer a documented set of crop rules to script-driven changes after the page has loaded. Check portrait and landscape orientations where relevant. If the component is reused inside a sidebar or modal, inspect those contexts separately rather than assuming the article page covers every geometry.",
        ],
      },
      {
        title: "Check lazy images and dynamically inserted content",
        paragraphs: [
          "Long pages often look stable at the top and shift later while the reader scrolls. Give lazy-loaded images a reserved area too. Check content inserted above the reader’s current position, including embedded media and widgets. A screenshot taken after everything has loaded will not show what moved during the visit.",
          "Use a slower local network condition to observe transitions, then inspect a trace for stronger evidence. Keep comparison dimensions and page content consistent. Do not conclude that the issue is fixed just because a cached second load appears stable; the first uncached image path matters as well.",
        ],
      },
      {
        title: "Close the layout ticket with geometry evidence",
        paragraphs: [
          "Verify that the frame occupies the intended area before the image completes, and that the final content stays in that frame. Record the ratio, relevant breakpoints, and the trace showing the corrected behavior. Keep alternative text, responsive candidates, and loading policy intact.",
          "Use compression as a separate delivery improvement when the image is heavy. CompressByURL can prepare the asset, but the layout correction belongs in your HTML or component CSS. Re-test a representative card, full article image, and alternate mobile crop. That gives a more durable result than reducing image bytes and hoping the brief loading window hides the shift.",
        ],
      },
    ],
    sources: [
      {
        label: "web.dev: optimize Cumulative Layout Shift",
        url: "https://web.dev/articles/optimize-cls",
      },
    ],
    related: [
      "responsive-images-srcset-sizes",
      "nextjs-image-sizes-too-large",
      "lcp-image-lazy-loading",
    ],
    faqs: [
      {
        question: "Do smaller images automatically fix CLS?",
        answer:
          "No. They may arrive sooner, but layout stability depends on reserving the correct space and avoiding later geometry changes.",
      },
      {
        question: "Can width and height coexist with width: 100%?",
        answer:
          "Yes. Keep a correct intrinsic ratio and use CSS for fluid display. Confirm the resulting geometry in the real component.",
      },
    ],
    imageAlt:
      "Conceptual illustration of matching landscape images in three differently sized frames",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/resize-image",
        label: "Resize an image",
        description:
          "Create a static candidate with dimensions that fit your intended display.",
      },
      {
        path: "/compress-image",
        label: "Compress your images",
        description:
          "Compare measured output files while local image bytes stay in your browser.",
      },
    ],
    seoTitle: "Fix image-related Cumulative Layout Shift",
  },
  {
    slug: "css-background-image-lcp",
    title: "Optimize a CSS background image that delays LCP",
    description:
      "Diagnose late CSS hero backgrounds, choose markup or a matching preload, and keep mobile candidates from downloading unnecessarily.",
    category: "developer-guides",
    image: "delivery",
    dek: "A hero referenced only by a stylesheet can become discoverable later than an image in the document. Trace the actual request before changing the artwork, then choose a delivery strategy that matches the visual role.",
    summary: [
      "Confirm that the background is relevant to the measured LCP.",
      "Consider ordinary image markup for meaningful content.",
      "Match any preload to the resource the page will actually use.",
    ],
    sections: [
      {
        title: "Confirm the background is part of the critical path",
        paragraphs: [
          "Start with a browser trace and the reported LCP element. A decorative background might be visually prominent without being the issue selected by the test. Record the resource URL and when its request starts relative to the document and stylesheet.",
          "Find the rule that references it. The path might be in an external CSS file, an inline style, a media query, or a theme-generated block. These produce different discovery paths. Keep your investigation attached to the specific rule rather than assuming every CSS background requires the same intervention.",
        ],
      },
      {
        title: "Decide whether this is content or decoration",
        paragraphs: [
          "A meaningful product image should usually have content semantics and alternative text. A purely decorative texture can remain a background. The decision is about what the user needs, not a trick to improve an audit score. If the image explains the article, ordinary markup can be easier to make accessible and responsive.",
          "Moving an image into markup requires checking the layout and crop. Preserve text contrast and intended framing. Do not duplicate the same asset in both CSS and an image element. Keep decoration hidden from assistive technology when it carries no information, and keep meaningful content available independently of visual styling.",
        ],
      },
      {
        title: "Use preload only for a resource you need early",
        paragraphs: [
          "web.dev explains preloading responsive images and the importance of aligning early resource discovery with actual delivery. A preload can help when a critical asset is otherwise discovered late. It also commits bandwidth, so an unnecessary or mismatched preload can waste work.",
          "For a single known background, confirm the preload’s URL matches the URL requested by the CSS. For responsive images, verify the selected candidate at each relevant viewport. Avoid downloading a desktop background on mobile while a media query requests another file. Prefer the simplest strategy you can confirm in the Network panel.",
        ],
      },
      {
        title: "Reduce the source dimensions to the actual frame",
        paragraphs: [
          "Measure the hero area and consider the crop under object-fit or background-size behavior. A broad desktop image cropped into a tall mobile frame may need a separate composition. Reducing width alone might still retain a large amount of invisible image area.",
          "Export a candidate from the best available source and compare the subject at the target layouts. Keep enough pixels for the supported density without carrying a print-resolution original. Choose formats and quality after geometry is clear. The smallest file is not useful if the heading becomes unreadable against its new details or the subject falls outside the frame.",
        ],
      },
      {
        title: "Inspect styles and rendering after the resource arrives",
        paragraphs: [
          "If the image request is prompt and completes early, examine what keeps the hero from painting. Stylesheets, scripts, transitions, and visibility gates can delay presentation. A source-size change cannot directly remove those conditions. Check whether content is useful before client code finishes.",
          "Do not animate a critical content panel from a fully hidden state just to create a reveal. Keep decorative motion subordinate to the reading experience and honor reduced-motion preferences. Test a navigation with slower loading so you can observe whether the first view depends on a late effect or initialization.",
        ],
      },
      {
        title: "Verify one resource and a preserved visual composition",
        paragraphs: [
          "After implementing the discovery fix, inspect the request list for duplicate downloads. Check both the main desktop composition and the alternate narrow layout. Confirm the chosen asset, its bytes, and the critical element timing under the same test settings.",
          "Use the local resize and compression tools to produce the approved file, then change your own CSS or component references. Keep a note of the resource strategy and the reason for any preload. A future redesign should be able to remove that hint when the critical resource changes, rather than inheriting an obsolete download forever.",
        ],
        table: {
          columns: ["Image role", "Delivery decision to consider"],
          rows: [
            [
              "Meaningful hero photograph",
              "Accessible image markup and responsive candidates",
            ],
            [
              "Decorative critical background",
              "Matching discovery strategy and measured preload need",
            ],
            ["Offscreen decorative texture", "Defer or omit until useful"],
          ],
        },
      },
    ],
    sources: [
      {
        label: "web.dev: preload responsive images",
        url: "https://web.dev/articles/preload-responsive-images",
      },
    ],
    related: [
      "fix-lcp-image-resource-load-delay",
      "lcp-image-lazy-loading",
      "responsive-images-srcset-sizes",
    ],
    faqs: [
      {
        question: "Should every CSS background have a preload?",
        answer:
          "No. Reserve early loading for resources the initial view genuinely needs, and verify that the browser requests the same resource.",
      },
      {
        question: "Can the scanner measure CSS background timing?",
        answer:
          "No. A static inventory cannot establish rendered timing. Use your browser’s request timeline or performance report for that evidence.",
      },
    ],
    imageAlt:
      "Conceptual illustration of image tiles connected to a browser frame by a lavender ribbon",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/resize-image",
        label: "Resize an image",
        description:
          "Create a static candidate with dimensions that fit your intended display.",
      },
      {
        path: "/compress-image",
        label: "Compress your images",
        description:
          "Compare measured output files while local image bytes stay in your browser.",
      },
    ],
    seoTitle: "Optimize CSS background images for LCP",
  },
  {
    slug: "gtmetrix-next-gen-image-formats",
    title: "Fix “Serve images in next-gen formats” in GTmetrix",
    description:
      "Convert suitable images to WebP or AVIF, update responsive references, and confirm the live response rather than simply renaming the file extension.",
    category: "web-performance",
    image: "formats",
    dek: "Converting a source file does not change what the page serves. Follow the reported URL through your template and delivery system, then verify the encoded format and selected candidate in the browser.",
    summary: [
      "Compare modern formats on the same resized pixels.",
      "Update srcset and picture references along with src.",
      "Confirm the delivered content type and quality.",
    ],
    sections: [
      {
        title: "Use the report to identify a real delivery change",
        paragraphs: [
          "GTmetrix’s modern-format recommendation highlights image resources that may benefit from different encoding. Start with the reported URL and its page role. The finding does not establish that every image should be converted or that AVIF will always beat WebP for your content.",
          "Create a worksheet with original dimensions, original bytes, required transparency, and the template reference. Note which browsers and downstream systems your project supports. A downloadable asset intended for another application may have different compatibility needs from a photograph displayed only on a webpage. Make those requirements explicit before selecting an output.",
        ],
      },
      {
        title: "Compare candidates from the same source pixels",
        paragraphs: [
          "Choose the intended dimensions and crop first. Export a WebP candidate and, where supported by your workflow, a static AVIF candidate from that same source. Compare the visible result and measured bytes. Do not use equal numeric quality values as proof of equal quality across encoders.",
          "Inspect faces, fine patterns, text, and gradients. If a candidate is only slightly smaller but much more expensive to generate or awkward to deploy, document that tradeoff. Keep an existing efficient file when the conversion does not produce an acceptable saving. Your decision should survive the removal of the audit label.",
        ],
      },
      {
        title: "Preserve transparency and static-image boundaries",
        paragraphs: [
          "Check transparent logos against both the actual background and a contrasting inspection background. A solid-background export can hide the loss of alpha until the image is used elsewhere. JPEG is not an appropriate replacement when transparency is required.",
          "This workflow concerns static images. CompressByURL does not optimize animated GIF, WebP, or AVIF. Do not import an animation and assume a static result preserves its meaning. Keep animated assets in a separate workflow and record them as outside this tool’s scope. A speed recommendation should not quietly erase useful content.",
        ],
      },
      {
        title: "Update the complete set of page references",
        paragraphs: [
          "Change the image source and any responsive candidates that still point to the previous format. If picture provides alternatives, check the source order, media conditions, and declared types. If your framework or CDN negotiates formats, inspect the actual response rather than assuming a filename extension describes the bytes.",
          "Do not rename a JPEG to .webp. Conversion means creating a genuinely encoded output, serving the appropriate content type, and having the page request it. Update caches or versioned URLs using your existing hosting workflow. Preserve the original source in your archive so future changes do not start from a lossy derivative.",
        ],
      },
      {
        title: "Validate desktop and mobile delivery separately",
        paragraphs: [
          "A desktop report can pass while a mobile source still points to an older large file. Load the page freshly at each important layout and inspect the selected resource. Compare transferred bytes and visual quality. If the page uses different crops, verify both compositions rather than only the format label.",
          "Check the fallback path when your project actually requires one. Avoid adding unnecessary parallel downloads. Watch for images loaded from both a CSS background and an ordinary image element. The useful result is one appropriate requested resource for each visible image, with intentional alternatives rather than duplicate requests.",
        ],
      },
      {
        title: "Keep score claims separate from file improvements",
        paragraphs: [
          "Suppose a controlled example produces an acceptable 120 KB WebP from a 240 KB source. That is a 50% file-size reduction for that example. It is not evidence of a 50% LCP reduction, a ranking increase, or approval by an advertising platform. Measure page behavior after publishing.",
          "Use the converter for owned assets, download the approved output, and deploy through your site’s template or CMS. Re-run the report under the same settings and inspect remaining flagged URLs individually. Keep a conversion only when it meets the image’s purpose and your delivery requirements.",
        ],
        table: {
          columns: ["Observation", "Meaning"],
          rows: [
            ["New extension, old encoded bytes", "Renaming did not convert the image"],
            ["Converted file, old srcset", "Some layouts may still request the original"],
            [
              "Correct format, excessive dimensions",
              "Sizing remains a separate opportunity",
            ],
          ],
        },
      },
    ],
    sources: [
      {
        label: "GTmetrix: serve images in next-gen formats",
        url: "https://gtmetrix.com/serve-images-in-next-gen-formats.html",
      },
    ],
    related: [
      "webp-vs-avif-vs-jpeg",
      "webp-bigger-than-jpeg",
      "responsive-images-srcset-sizes",
    ],
    faqs: [
      {
        question: "Is AVIF always the best output?",
        answer:
          "No. Compare actual visual quality, bytes, encode cost, and delivery compatibility for the specific image.",
      },
      {
        question: "Will changing the extension satisfy the recommendation?",
        answer:
          "No. The file must actually be encoded in the intended format, and the page must request that output.",
      },
    ],
    imageAlt:
      "Conceptual illustration of three image tiles made from different translucent materials",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/image-converter",
        label: "Compare image formats",
        description:
          "Export a supported static format and inspect quality and actual bytes.",
      },
      {
        path: "/website-image-scanner",
        label: "Scan a public webpage",
        description:
          "Discover static image candidates before inspecting important resources in your browser.",
      },
    ],
    seoTitle: "GTmetrix next-gen image formats guide",
  },
  {
    slug: "avoid-enormous-network-payloads-images",
    title: "Reduce image weight behind “Avoid enormous network payloads”",
    description:
      "Prioritize aggregate image transfer in heavy pages, distinguish images from script weight, and build a manageable replacement batch with real byte evidence.",
    category: "website-audits",
    image: "audit",
    dek: "A page can be heavy because of one hero or fifty individually reasonable images. Add up actual delivered resources before selecting a compression batch, and keep image work separate from unrelated JavaScript and video costs.",
    summary: [
      "Sort real requests by transfer, then group them by purpose.",
      "Consider aggregate image cost and repeated asset use.",
      "Downloaded replacements still require deployment and verification.",
    ],
    sections: [
      {
        title: "Separate image bytes from the total page payload",
        paragraphs: [
          "GTmetrix’s payload recommendation concerns the page’s aggregate network resources, not images alone. Open the report and determine which types dominate. If scripts or video account for most transfer, an image-only pass may help without addressing the main problem.",
          "Create separate subtotals for images, scripts, fonts, and other media. Keep the tested state consistent: initial navigation, after scrolling, and after opening a gallery are different observations. Record which state you intend to optimize. A large optional gallery should not be confused with unavoidable first-view transfer.",
        ],
      },
      {
        title: "Build an inventory that avoids double-counting",
        paragraphs: [
          "List unique requested image URLs and their transferred sizes under the chosen test conditions. Several elements can reference the same resource. The rendered element count is therefore not a direct byte total. Conversely, different query parameters or derivative filenames can create distinct downloads of visually identical content.",
          "Inspect unusually similar resources to find accidental duplicate variants. Keep genuine crops and density variants separate. If a resource came from cache, note that rather than claiming a zero-byte original. A cold navigation and a repeat visit answer different questions; both can matter, but they need separate worksheets.",
        ],
      },
      {
        title: "Use an illustrative budget to prioritize a batch",
        paragraphs: [
          "Imagine a page with twenty 150 KB card images. Their source files total about 3 MB before considering delivery behavior and caching. That arithmetic illustrates aggregate cost, not a benchmark from this website. A batch of smaller card variants may be more useful than aggressively degrading one already efficient hero.",
          "Choose a budget based on the page’s purpose and audience. A photographic portfolio and a text-first help page have different legitimate media needs. Define which images are needed initially and which are optional later. Remove redundant decoration when it carries no information rather than endlessly recompressing it.",
        ],
      },
      {
        title: "Fix dimensions and repetition before chasing marginal encodes",
        paragraphs: [
          "Look for source originals used in small cards and the same image delivered under several URLs. Correct those template-level issues first. A smaller responsive variant can preserve quality better than an extreme quality reduction on an unnecessarily large source.",
          "Then compare encodes for the remaining owned assets. Keep original files and map each output to its responsible template. Avoid a batch setting that removes transparency or blurs every screenshot. Inspect representative content types before applying the same settings across the full queue.",
        ],
      },
      {
        title: "Make offscreen delivery intentional",
        paragraphs: [
          "Review the loading policy of long galleries and article image sequences. Check what the browser requests before the reader reaches those regions. Hiding content in CSS does not establish that no image request occurs. Inspect actual behavior during a fresh navigation.",
          "Preserve eager discovery for the confirmed critical first-view image. Defer suitable offscreen content without removing reserved geometry. If a gallery is only opened on demand, its data and resource loading may need to follow that interaction. Keep that feature change separate from static image compression so the tradeoff is reviewable.",
        ],
      },
      {
        title: "Verify aggregate savings after deploying the bundle",
        paragraphs: [
          "Use the website scanner to discover candidates and the optimizer to prepare selected replacements locally. The resulting ZIP does not publish itself. Upload the files, update references, and retest the same page state. Confirm that the expected smaller variants are now requested.",
          "Record the image subtotal, total payload, and the number of remaining actionable resources. Compare actual results with the original worksheet. If total transfer barely changes, inspect scripts, widgets, or duplicated requests before recompressing the same files again. Keep the next batch small enough that you can verify it clearly.",
        ],
        table: {
          columns: ["Finding", "Useful next action"],
          rows: [
            ["Large original in small card", "Create and request a right-sized variant"],
            ["Many medium files in first view", "Review necessity and aggregate budget"],
            ["Heavy offscreen gallery", "Inspect deferred loading behavior"],
            [
              "Scripts dominate total bytes",
              "Open a separate script-delivery investigation",
            ],
          ],
        },
      },
    ],
    sources: [
      {
        label: "GTmetrix: avoid enormous network payloads",
        url: "https://gtmetrix.com/avoid-enormous-network-payloads.html",
      },
    ],
    related: [
      "image-pagespeed-checklist",
      "gtmetrix-properly-size-images",
      "find-large-images-on-a-website",
    ],
    faqs: [
      {
        question: "Is there one perfect image budget for every site?",
        answer:
          "No. Set a budget around the page’s purpose and visitor conditions, then measure whether each resource earns its cost.",
      },
      {
        question: "Can an image compressor fix heavy JavaScript?",
        answer:
          "No. Image optimization changes image assets. Script transfer and execution require their own investigation.",
      },
    ],
    imageAlt:
      "Conceptual illustration of a magnifying lens inspecting landscape image tiles",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/website-image-scanner",
        label: "Scan a public webpage",
        description:
          "Discover static image candidates before inspecting important resources in your browser.",
      },
      {
        path: "/website-image-optimizer",
        label: "Prepare a replacement bundle",
        description:
          "Select discovered candidates and optimize fetched image bytes locally.",
      },
    ],
    seoTitle: "Reduce enormous image network payloads",
  },
  {
    slug: "pagespeed-vs-gtmetrix-images",
    title: "Why PageSpeed and GTmetrix disagree about your images",
    description:
      "Compare image findings across PageSpeed Insights and GTmetrix by aligning test settings, selected resources, lab metrics, and available field data.",
    category: "web-performance",
    image: "performance",
    dek: "Two different scores do not establish that either report is broken. First compare what each test loaded, at which viewport and under which conditions, then investigate the image finding they actually share.",
    summary: [
      "Compare the same page state and selected image candidate.",
      "Record viewport, location, network, and cache differences.",
      "Keep lab diagnostics separate from real-user history.",
    ],
    sections: [
      {
        title: "Compare the tested page before comparing its score",
        paragraphs: [
          "Record the exact URL and final redirect destination for both reports. Check whether the page content matches: a consent banner, experiment, authentication state, or region-specific widget can alter the first view. A test of one content state is not directly comparable to another.",
          "Save the screenshot and image resource list from each report. Compare the critical visible region and selected hero candidate. If one test requested a desktop original and the other a mobile derivative, you already have a concrete investigation. Explain that difference before treating the score gap as a mysterious tool disagreement.",
        ],
      },
      {
        title: "Write down environmental differences",
        paragraphs: [
          "GTmetrix documents differences in testing methodology and configurable analysis settings. A different viewport, connection, location, or processing condition can change which image is selected and how long it takes to appear. Read the settings shown in your actual reports rather than assuming defaults from an old tutorial.",
          "Build a short comparison table beside the results. Mark a setting as unavailable if you cannot inspect it. Do not manufacture identical environments by guessing missing values. Use each tool consistently for before/after measurements and use cross-tool comparisons to generate questions, not to claim a precise improvement percentage.",
        ],
      },
      {
        title: "Distinguish Lighthouse diagnostics from visitor history",
        paragraphs: [
          "Google’s PageSpeed documentation explains the distinction between lab and field data. A lab run examines a controlled navigation, while available field data reflects real visits over a reporting period. A newly deployed image replacement can affect a fresh lab navigation before a historical field summary visibly changes.",
          "Read the scope of field data, including whether it applies to a URL or a broader origin. If no field data is available, say so. Do not report an origin-level result as proof that one article image is fixed. Keep your deployment date in the worksheet so later comparisons have a meaningful boundary.",
        ],
      },
      {
        title: "Reconcile warnings at the resource level",
        paragraphs: [
          "Match findings by actual resource URL and page use rather than by audit label alone. Lighthouse terminology can change, and tools can organize recommendations differently. A sizing issue in one report and an image-delivery opportunity in another may lead to the same underlying asset correction.",
          "Check the actual source dimensions, display slot, and transferred bytes. If the reports disagree about the resource, inspect a local browser navigation at the relevant viewport. A CMS derivative, cached URL, or CDN format response can explain the difference. This is more actionable than optimizing until every tool happens to display the same grade.",
        ],
      },
      {
        title: "Use repeated runs to avoid treating noise as progress",
        paragraphs: [
          "Measure the same tool configuration several times before and after deployment. Note variable server response and external resources. A single favorable run is weak evidence, particularly when the change was a tiny image reduction and the rest of the page is dynamic.",
          "Check whether the expected mechanical result happened: smaller bytes, correct candidate width, earlier discovery, or stable geometry. These observations can support the implementation even when total timing fluctuates. Keep them separate from uncertain score changes so you can explain what the patch actually accomplished.",
        ],
      },
      {
        title: "Turn disagreement into one next debugging step",
        paragraphs: [
          "If one report flags a large mobile image, inspect responsive hints. If both request the same image but its request starts at different times, inspect discovery and the surrounding resource schedule. If the bytes are similar but paint differs, investigate rendering and scripts. Choose the next step from evidence.",
          "Use the scanner for an owned-asset inventory and the compressor for candidate files. Neither replaces the rendered test needed to measure timing. Finish the image work with live-resource evidence, then keep monitoring the visitor metrics that matter. A matching pair of grades is less useful than a clear record of the problem you solved.",
        ],
        table: {
          columns: ["Comparison field", "What to record"],
          rows: [
            ["Content state", "Redirects, banners, and visible page"],
            ["Device and viewport", "Layout and selected image candidate"],
            ["Delivery", "Resource URL, bytes, and cache state"],
            ["Timing evidence", "Lab navigation versus field summary"],
          ],
        },
      },
    ],
    sources: [
      {
        label: "GTmetrix: comparison with PageSpeed Insights",
        url: "https://gtmetrix.com/blog/gtmetrix-vs-pagespeed-insights/",
      },
      {
        label: "Google: about PageSpeed Insights",
        url: "https://developers.google.com/speed/docs/insights/v5/about",
      },
    ],
    related: [
      "fix-lcp-image-resource-load-delay",
      "image-pagespeed-checklist",
      "gtmetrix-next-gen-image-formats",
    ],
    faqs: [
      {
        question: "Which score is the correct one?",
        answer:
          "Each reflects its own conditions and methodology. Compare settings and resource behavior, and use available real-user data to assess visitor experience.",
      },
      {
        question: "Why did field data not change immediately?",
        answer:
          "Field summaries reflect a reporting period of real visits. A fresh lab run can respond to a deployment sooner than that historical data.",
      },
    ],
    imageAlt:
      "Conceptual illustration of a lavender stopwatch and an image travelling toward a browser frame",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/website-image-scanner",
        label: "Scan a public webpage",
        description:
          "Discover static image candidates before inspecting important resources in your browser.",
      },
      {
        path: "/compress-image",
        label: "Compress your images",
        description:
          "Compare measured output files while local image bytes stay in your browser.",
      },
    ],
    seoTitle: "PageSpeed vs GTmetrix: image results",
  },
  {
    slug: "find-oversized-images-devtools",
    title: "Find oversized images with Chrome DevTools and currentSrc",
    description:
      "Identify the image a browser actually downloaded, compare its slot and selected source, and capture a useful image audit without guessing from filenames.",
    category: "developer-guides",
    image: "audit",
    dek: "The source in your CMS is not always the image your visitor receives. Use the element’s selected resource and the Network panel together to find the delivered variant that needs changing.",
    summary: [
      "Inspect the actual selected resource, not just src.",
      "Compare delivery with the computed display slot.",
      "Keep cache state and test viewport in the evidence.",
    ],
    sections: [
      {
        title: "Start with a controlled navigation",
        paragraphs: [
          "Open the relevant public page with DevTools already available and record the viewport. Reload under a consistent cache condition. The Network panel lets you inspect requests and transferred resources; use image filtering or resource types to narrow the list.",
          "Distinguish a cold navigation from a repeat visit. A resource served from cache is useful performance behavior, but it does not establish that its uncached transfer is efficient. Note redirects, consent banners, and any interaction you perform before measuring. That makes your screenshot and resource list reproducible by another developer.",
        ],
      },
      {
        title: "Identify the visible element and its selected source",
        paragraphs: [
          "Select the image in the Elements panel and inspect its source candidates. MDN defines currentSrc as the full URL of the selected image resource. That property helps distinguish the file the browser chose from the fallback src shown in the markup.",
          "Match that URL to the Network entry. A resource name with a width parameter is a hint, not proof of the decoded dimensions. Inspect the actual asset or available image metadata where needed. For backgrounds, follow the computed CSS rule and its request instead; currentSrc applies to image elements, not every visual region.",
        ],
      },
      {
        title: "Compare the delivery width to the actual slot",
        paragraphs: [
          "Measure the element’s displayed width in CSS pixels and consider your chosen density target. In an illustrative card, a 300 CSS-pixel slot on a 2× display could justify a 600-pixel candidate. A 2400-pixel original in that slot deserves investigation, but confirm crop and expected density before declaring a smaller width correct.",
          "Repeat at another important breakpoint. A source used by both a card and a large detail page may need separate variants. Fix the requesting template rather than overwriting the only original with a thumbnail. Write down the slot measurements so responsive markup changes can be checked against real geometry.",
        ],
      },
      {
        title: "Read bytes and timing as different evidence",
        paragraphs: [
          "The Network panel can show resource and transfer information, and its waterfall helps locate request timing. Record which value you are using. A file’s size on disk, an encoded response, and a transfer observed with cache behavior are related but not interchangeable.",
          "For a critical image, also look at when the request begins. A small file discovered late can still be a performance problem. A large file requested early may need resizing or encoding. Keep both observations in the issue so an asset change does not get mistaken for a discovery fix.",
        ],
      },
      {
        title: "Use a short read-only console check when useful",
        paragraphs: [
          "This small browser-console example lists ordinary image elements on the current page. It reads their selected URL and display box without sending data anywhere. It excludes CSS backgrounds and cannot tell you the complete network transfer history. Treat the output as an element inventory, not a performance score.",
          "Run it only on a page you are inspecting, then map an interesting row back to the Network entry. A zero natural width can indicate an image that has not loaded successfully or has not completed loading. Do not treat that value as proof that the image has no cost.",
        ],
        code: {
          language: "javascript",
          caption:
            "Read-only image inventory for the current document. It does not fetch extra resources or include CSS backgrounds.",
          text: "Array.from(document.images, (image) => ({\n  source: image.currentSrc || image.src,\n  displayWidth: Math.round(image.getBoundingClientRect().width),\n  naturalWidth: image.naturalWidth,\n  loaded: image.complete && image.naturalWidth > 0\n}));",
        },
      },
      {
        title: "Make the issue actionable for the asset owner",
        paragraphs: [
          "Attach the page, viewport, selected URL, slot width, observed bytes, and proposed replacement. If the problem is an inaccurate sizes expression, name the component. If it is an inefficient source, attach the approved exported candidate. Avoid a vague ticket that says only “optimize images.”",
          "Use the website scanner to gather additional static candidates, then confirm important ones in DevTools. After deployment, repeat the same navigation and verify the requested file. Keep the original and your measurements so the next edit can explain both what changed and why.",
        ],
      },
    ],
    sources: [
      {
        label: "Chrome: Network panel reference",
        url: "https://developer.chrome.com/docs/devtools/network/reference",
      },
      {
        label: "MDN: currentSrc",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/currentSrc",
      },
    ],
    related: [
      "responsive-images-srcset-sizes",
      "gtmetrix-properly-size-images",
      "website-image-scanner-limitations",
    ],
    faqs: [
      {
        question: "Does currentSrc include background images?",
        answer:
          "No. It belongs to HTML image elements. Inspect computed background styles and their network requests separately.",
      },
      {
        question: "Can I judge mobile selection by shrinking a loaded desktop page?",
        answer:
          "Use a fresh mobile navigation as stronger evidence. A browser can keep a larger candidate it already downloaded.",
      },
    ],
    imageAlt:
      "Conceptual illustration of a magnifying lens inspecting landscape image tiles",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/website-image-scanner",
        label: "Scan a public webpage",
        description:
          "Discover static image candidates before inspecting important resources in your browser.",
      },
      {
        path: "/resize-image",
        label: "Resize an image",
        description:
          "Create a static candidate with dimensions that fit your intended display.",
      },
    ],
    seoTitle: "Find oversized images in Chrome DevTools",
  },
  {
    slug: "website-image-scanner-limitations",
    title: "What a website image scanner can find, and what needs a browser",
    description:
      "Understand HTML image discovery, lazy source hints, srcset candidates, fetch limits, and the difference between a static inventory and a rendered performance audit.",
    category: "website-audits",
    image: "audit",
    dek: "A static scanner is an asset-discovery tool. It can give you a practical starting inventory without executing a webpage, but it cannot prove which image a browser paints or measure your Core Web Vitals.",
    summary: [
      "HTML discovery produces candidates rather than rendered-page truth.",
      "Unknown bytes or dimensions remain unknown.",
      "Confirm important resources with a real browser before deployment.",
    ],
    sections: [
      {
        title: "Understand the discovery model before reading the results",
        paragraphs: [
          "CompressByURL fetches one public page and extracts image candidates from the returned HTML. The current parser checks ordinary image sources, supported lazy-source attributes, srcset, picture source candidates, and image preload hints. It normalizes discovered URLs and keeps a bounded result set.",
          "That model is useful for an initial inventory because it does not require executing another site’s scripts. It also defines the limits of the output. The manifest describes what was found in the fetched document, not everything a logged-in user or a fully initialized browser might eventually see. Keep that distinction visible in your audit notes.",
        ],
      },
      {
        title: "Treat responsive sources as candidates, not simultaneous downloads",
        paragraphs: [
          "An HTML document can list several responsive variants of the same photograph. The scanner can surface those URLs without choosing the one a particular visitor would download. A browser makes its selection using the available markup and environment. Do not add every candidate’s file size and call the sum a visitor’s page payload.",
          "Group variants by their likely component and inspect the actual page at important viewports. Keep a smaller thumbnail, a larger hero, and an alternate crop distinguishable. If the browser requests an unexpectedly large variant, the next step may be a template hint correction rather than a batch conversion of every discovered URL.",
        ],
      },
      {
        title: "Expect gaps for scripts, stylesheets, and private pages",
        paragraphs: [
          "Images created only after client-side code runs may not appear in the fetched HTML. The current tool does not execute scripts or behave as a full-site crawler. External stylesheet backgrounds and authenticated views are not a guaranteed part of this inventory. Do not infer that an absent asset is absent from the rendered page.",
          "Use a browser for the missing regions you own or can access legitimately. Compare actual requests and computed styles with the manifest. If a theme creates a gallery after interaction, record that separate state. A static scan of the initial page is still useful, but it needs a clear scope rather than an inflated completeness claim.",
        ],
      },
      {
        title: "Keep security and fetch failures separate from image quality",
        paragraphs: [
          "The server layer accepts only validated public HTTP or HTTPS resources. Private destinations, unsafe redirects, unacceptable content, and responses beyond time or byte budgets can be rejected. The tool does not forward your browser’s cookies or authorization headers to remote sites.",
          "A failure is therefore not automatically a broken website image. It can mean the resource is private, blocked, too large for this bounded workflow, or not an image the tool supports. Preserve the error context and inspect an owned resource separately. Do not turn a scanner failure into an unsupported SEO diagnosis.",
        ],
      },
      {
        title: "Use missing values honestly in the audit worksheet",
        paragraphs: [
          "If the scan cannot establish bytes or intrinsic dimensions, mark them unknown. Zero means something different from unknown. A HTML width hint can help understand intent, but it is not proof of decoded source dimensions or rendered geometry.",
          "Prioritize known large candidates while checking important unknown resources in your browser. Keep the manifest’s limit and truncation information with the result. A bounded inventory that says it stopped is more useful than an apparently exhaustive list that quietly omits content. Do not present a truncated scan as a full-page performance certification.",
        ],
      },
      {
        title: "Turn a candidate list into a verified replacement workflow",
        paragraphs: [
          "Select useful owned candidates, retrieve supported bytes, and optimize them locally. Check the result’s crop, clarity, and transparency. Download a replacement bundle and map each file back to the media entry or template that needs changing. Compression happens in the browser after bytes arrive.",
          "Then deploy through your own system and inspect the rendered page. Use an appropriate performance report for LCP, layout stability, and timing evidence. The scanner saves discovery effort; the browser closes the verification gap. Keep both steps in the process so your image audit ends with an accurate change, not merely a long inventory.",
        ],
        table: {
          columns: ["Question", "Appropriate evidence"],
          rows: [
            ["Which URLs are in fetched HTML?", "Static scan manifest"],
            ["Which responsive file is used?", "Browser currentSrc and Network"],
            ["When does the hero paint?", "Rendered performance trace"],
            ["Was the site updated?", "Live page after your deployment"],
          ],
        },
      },
    ],
    sources: [
      {
        label: "MDN: image element and responsive source attributes",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img",
      },
    ],
    related: [
      "find-large-images-on-a-website",
      "find-oversized-images-devtools",
      "image-url-cors-errors",
    ],
    faqs: [
      {
        question: "Does the scanner crawl my whole site?",
        answer:
          "No. It inspects one public page at a time and returns a bounded candidate manifest.",
      },
      {
        question: "Does a clean inventory prove good Core Web Vitals?",
        answer:
          "No. Static HTML discovery cannot measure rendering, interactions, or actual layout shifts. Use a rendered browser and appropriate performance data.",
      },
    ],
    imageAlt:
      "Conceptual illustration of a magnifying lens inspecting landscape image tiles",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/website-image-scanner",
        label: "Scan a public webpage",
        description:
          "Discover static image candidates before inspecting important resources in your browser.",
      },
      {
        path: "/website-image-optimizer",
        label: "Prepare a replacement bundle",
        description:
          "Select discovered candidates and optimize fetched image bytes locally.",
      },
    ],
    seoTitle: "Website image scanner: scope and limits",
  },
  {
    slug: "wordpress-image-optimization-without-plugin",
    title: "Optimize WordPress images without adding another plugin",
    description:
      "Prepare smaller media files locally, preserve originals, and check the theme’s responsive image output before replacing assets in WordPress.",
    category: "developer-guides",
    image: "delivery",
    dek: "Start with the image WordPress actually serves, not just the file you uploaded. You can improve source assets without adding a plugin, but the theme and generated derivatives still need inspection.",
    summary: [
      "Check theme output and selected media size.",
      "Prepare suitable master files before uploading.",
      "Verify generated variants and caches on the public page.",
    ],
    sections: [
      {
        title: "Find the template and media size responsible for the request",
        paragraphs: [
          "Inspect a representative post, card, and hero in the browser. Record the selected image URL and display width. WordPress documents responsive image support and the generated source candidates. A theme can still request an unsuitable size or output markup that does not fit its layout.",
          "Locate the media entry and the template that uses it. An original camera file may be appropriate as an archive but unnecessary for a small public card. Do not overwrite the only master simply because one view is heavy. Decide whether you need a better source upload, a different generated size, or a template correction.",
        ],
      },
      {
        title: "Prepare a smaller master from an untouched original",
        paragraphs: [
          "Choose dimensions that cover the largest real use in your theme. Preserve the original outside the public delivery workflow. Resize once from that original, then compare encodes. Check photo detail, visible text, and any transparent areas before selecting a file.",
          "Use descriptive versioned names when your editorial process allows them. Keep a note of intended crop and maximum display use. Uploading a 400-pixel thumbnail as the only source can make a later full-width article look soft. Uploading a print-resolution file for every small illustration can make the workflow unnecessarily expensive.",
        ],
      },
      {
        title: "Check the format through the complete media pipeline",
        paragraphs: [
          "Before changing formats broadly, confirm that your WordPress installation, hosting image libraries, and theme can handle the chosen output. A file that uploads successfully can still have derivative or downstream integration issues. Test one ordinary image and one transparent graphic before converting a whole library.",
          "Compare the generated candidate bytes and visible quality, not only the uploaded master. If the system regenerates an unexpectedly large variant, trace its configured dimensions and quality. Keep the established delivery system where it works. A local compression pass is meant to improve assets, not quietly replace your entire media architecture.",
        ],
      },
      {
        title: "Replace content references without losing editorial details",
        paragraphs: [
          "Update the relevant block or template reference to the new media entry. Preserve meaningful alt text and captions. Check internal links that point to the old downloadable file, especially if the image is also used as a document attachment or product resource.",
          "Do not remove an old media item until you understand where it is used. Shared thumbnails, social previews, and older articles can depend on it. A reversible change starts with a known new file and a limited set of reference updates. Record where the replacement was made so you can roll back if a crop problem appears.",
        ],
      },
      {
        title: "Inspect the public page and its responsive derivatives",
        paragraphs: [
          "Open the page as a visitor at narrow and wide layouts. Read the selected source and Network request. Confirm that responsive candidates match the theme’s display slots. An editor preview or media-library thumbnail is not enough evidence that the public page now serves the right file.",
          "Check caches at the page, asset, and CDN layers that your site actually uses. A versioned URL can make a replacement easier to verify, but follow the hosting workflow instead of clearing every cache blindly. Ensure the image area remains stable and that the intended crop is visible on mobile.",
        ],
      },
      {
        title: "Make future uploads follow the same lightweight checklist",
        paragraphs: [
          "Write a short publishing standard with the maximum useful master width, acceptable format choices, and the visible details editors should inspect. Keep it tied to your real theme. A generic rule such as “everything must be under 100 KB” can create unreadable diagrams and inadequate hero images.",
          "CompressByURL can prepare local files or help identify public webpage candidates. It does not connect to your WordPress account or update posts automatically. Download the approved files, upload them yourself, and verify the final page. A consistent input and template process is more durable than repairing each oversized upload after it reaches production.",
        ],
        bullets: [
          "Keep original masters available.",
          "Test one replacement before a library-wide change.",
          "Preserve alt text and intentional captions.",
          "Check actual responsive requests after publishing.",
        ],
      },
    ],
    sources: [
      {
        label: "WordPress developer handbook: responsive images",
        url: "https://developer.wordpress.org/apis/responsive-images/",
      },
    ],
    related: [
      "responsive-images-srcset-sizes",
      "gtmetrix-properly-size-images",
      "image-pagespeed-checklist",
    ],
    faqs: [
      {
        question: "Does this require access to my WordPress account?",
        answer:
          "You need your normal publishing access to replace site assets. CompressByURL does not receive that access or publish on your behalf.",
      },
      {
        question: "Should I delete old originals immediately?",
        answer:
          "No. Identify shared uses and preserve a rollback path before removing or replacing media.",
      },
    ],
    imageAlt:
      "Conceptual illustration of image tiles connected to a browser frame by a lavender ribbon",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/compress-image",
        label: "Compress your images",
        description:
          "Compare measured output files while local image bytes stay in your browser.",
      },
      {
        path: "/website-image-scanner",
        label: "Scan a public webpage",
        description:
          "Discover static image candidates before inspecting important resources in your browser.",
      },
    ],
    seoTitle: "WordPress image optimization without a plugin",
  },
  {
    slug: "webp-bigger-than-jpeg",
    title: "Why your WebP is bigger than the original JPEG",
    description:
      "Diagnose WebP conversions that grow in size by checking dimensions, lossy versus lossless settings, source quality, and actual visual acceptance.",
    category: "image-optimization",
    image: "formats",
    dek: "A modern format is not a promise of a smaller file. If a conversion grows, compare the actual export settings and source pixels before assuming the converter is broken.",
    summary: [
      "Hold dimensions constant before judging the format.",
      "Compare visual quality rather than matching slider numbers.",
      "Keep the original when a new export offers no useful benefit.",
    ],
    sections: [
      {
        title: "Compare the two actual files before drawing a conclusion",
        paragraphs: [
          "Record bytes, pixel dimensions, and transparency for the input and output. Confirm that the output really is WebP rather than a renamed file or an unsupported browser fallback. Open both in a view where the image is displayed at its intended size.",
          "If the output grew in dimensions or gained unnecessary metadata, you are not testing format alone. Keep an untouched original and a simple worksheet. A tiny already compressed JPEG is a different starting point from a large high-quality camera source. The same conversion settings do not produce equal relative savings across those cases.",
        ],
      },
      {
        title: "Check whether the export path is lossless or unusually conservative",
        paragraphs: [
          "MDN’s format guide distinguishes the capabilities of JPEG, WebP, and other image containers. WebP can be used in different encoding modes. A lossless or very conservative export may preserve detail the JPEG source has already discarded and can therefore produce a larger result.",
          "Inspect the tool’s actual mode, not just the output extension. If your workflow requires lossless preservation of the decoded source, a larger result might be an acceptable tradeoff. If your goal is a visually equivalent web photograph, compare a suitable lossy path instead. The correct choice follows the image’s purpose.",
        ],
      },
      {
        title: "Do not compare equal quality numbers across encoders",
        paragraphs: [
          "A quality value is an encoder control, not a universal visual unit. The same number on two export paths does not establish that they preserve the same detail or produce the same bytes. Compare the actual result, especially textures, gradients, and fine edges.",
          "Prepare a small set of outputs from the same resized source. Reject unacceptable artifacts and compare the remaining file sizes. Avoid lowering quality repeatedly on the last lossy output; return to the original for each candidate. You cannot restore information previously removed from a JPEG by converting it to another container.",
        ],
      },
      {
        title: "Check dimensions before spending time on marginal savings",
        paragraphs: [
          "A large source used in a small slot may offer more useful savings from resizing than from changing format at full resolution. In an illustrative card, a 2400-pixel source displayed at 300 CSS pixels deserves a sizing investigation before a series of format experiments.",
          "Choose a candidate width that suits the real layout and supported density. Then compare JPEG and WebP at that width. Keep a separate larger variant if another component needs it. Do not compress the sole master into a thumbnail just because one page use is small.",
        ],
      },
      {
        title: "Inspect browser export support in custom workflows",
        paragraphs: [
          "If you are writing a canvas-based exporter, inspect the returned blob’s type and whether export succeeded. MDN documents toBlob behavior, including supported type handling. The requested MIME string alone is not proof that the browser produced the intended output.",
          "For a custom application, treat output validation and error handling as part of the encoder interface. A fallback or null result should not be silently saved under a misleading extension. In a user-facing tool, compare the named output format with the actual downloadable file and communicate unsupported paths clearly.",
        ],
      },
      {
        title: "Keep the smaller acceptable file without format loyalty",
        paragraphs: [
          "If the original JPEG remains smaller and visually suitable, keep it unless your delivery requirements provide another reason to change. A mixed-format website is ordinary. Consistency in crop, dimensions, and publishing standards matters more than converting every file to one extension.",
          "Use the image converter to create a controlled comparison, then deploy only an accepted improvement. Record the before/after file bytes and chosen dimensions. If a conversion grows, that observation is useful evidence for this image. It does not prove that the format is bad or that every future conversion will behave the same way.",
        ],
        table: {
          columns: ["Possible reason", "Check"],
          rows: [
            ["Different dimensions", "Compare actual pixel widths and heights"],
            [
              "Lossless or high-quality output",
              "Inspect encoder mode and visual requirement",
            ],
            ["Already efficient input", "Compare measured candidate bytes"],
            ["Unsupported custom export", "Check blob type and export result"],
          ],
        },
      },
    ],
    sources: [
      {
        label: "MDN: image formats and capabilities",
        url: "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types",
      },
      {
        label: "MDN: canvas toBlob export behavior",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob",
      },
    ],
    related: [
      "webp-vs-avif-vs-jpeg",
      "gtmetrix-efficiently-encode-images",
      "gtmetrix-next-gen-image-formats",
    ],
    faqs: [
      {
        question: "Is a larger WebP always a converter bug?",
        answer:
          "No. Encoding mode, source quality, dimensions, and export behavior can all explain it. Compare the actual files before assigning a cause.",
      },
      {
        question: "Should I discard JPEG on every webpage?",
        answer:
          "No. Keep a JPEG when it meets compatibility and quality needs and compares well against alternatives.",
      },
    ],
    imageAlt:
      "Conceptual illustration of three image tiles made from different translucent materials",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/image-converter",
        label: "Compare image formats",
        description:
          "Export a supported static format and inspect quality and actual bytes.",
      },
      {
        path: "/resize-image",
        label: "Resize an image",
        description:
          "Create a static candidate with dimensions that fit your intended display.",
      },
    ],
    seoTitle: "Why WebP can be bigger than JPEG",
  },
  {
    slug: "compress-png-screenshots-sharp-text",
    title: "Compress PNG screenshots while keeping text sharp",
    description:
      "Reduce screenshot weight with lossless optimization, intentional crops, and careful resizing. Avoid blurry labels and damaged transparent edges.",
    category: "image-optimization",
    image: "compression",
    dek: "A screenshot is usually read, not merely viewed. Judge compression by whether its labels remain usable at the article’s display size, then remove bytes that do not help the reader.",
    summary: [
      "Inspect labels at the actual article display size.",
      "Try lossless PNG optimization before lossy conversion.",
      "Crop or split a dense screenshot when scaling makes it unreadable.",
    ],
    sections: [
      {
        title: "Decide what information the screenshot must preserve",
        paragraphs: [
          "List the labels, states, and highlighted controls the reader needs. Open the screenshot in the actual article column. A file can look sharp at full resolution and still be unreadable when the page reduces it to a narrow mobile width.",
          "Keep a clean original capture. Remove personal details before publishing through an appropriate editing workflow; compression is not redaction. If the screenshot’s purpose is one small control, a focused crop may communicate it better than a complete desktop view. Do not crop away context required to understand the instruction.",
        ],
      },
      {
        title: "Try a lossless PNG path before introducing artifacts",
        paragraphs: [
          "PNG is a useful format for precise reproduction and transparency. Use an optimization path that preserves the decoded pixels when those edges matter. In CompressByURL, the PNG route is an appropriate first comparison for a static screenshot that needs to remain PNG.",
          "Measure the result instead of assuming a large saving. Some sources are already efficient, and a lossless optimizer may have little room to reduce them. A small improvement is still valid if the visible content stays identical. Do not present a fixed savings percentage as an inherent property of screenshots.",
        ],
      },
      {
        title: "Resize only when the image contains genuinely unnecessary pixels",
        paragraphs: [
          "If the screenshot is far larger than its intended display, prepare a smaller candidate and inspect text. Scaling raster letters can soften their edges, especially when the target width makes them too small to read. Choose the display use first rather than forcing every screenshot to one nominal width.",
          "Consider separate overview and detail images. The overview explains location; the detail makes the relevant label legible. This is an editorial composition choice, not a magic encoder setting. Keep captions clear about which region the detail shows and preserve enough surroundings to avoid confusing the reader.",
        ],
      },
      {
        title: "Compare alternative formats without sacrificing readability",
        paragraphs: [
          "A photographic lossy export can add ringing around text or change thin interface lines. Inspect those areas deliberately. If your delivery system supports alternative formats, compare actual output bytes and the displayed screenshot rather than copying quality settings from a photo workflow.",
          "Check transparency against the page background when the capture includes rounded corners or isolated UI. A solid-background conversion may look fine in one article but fail in another theme. Keep the accepted format aligned with the content’s requirements. Static AVIF or WebP may be worth testing, but the format name alone does not establish a better result.",
        ],
      },
      {
        title: "Keep screenshot presentation stable and accessible",
        paragraphs: [
          "Supply correct dimensions or a reserved frame so the article does not jump when the image arrives. Use descriptive alt text that communicates the essential information, and explain important settings in nearby text rather than relying solely on tiny labels inside a bitmap.",
          "For a long procedure, several focused screenshots can be easier to follow than one enormous composite. Check the page on mobile and verify that a reader can still understand the instructions. A file-size target has failed if it saves bandwidth by making the tutorial unusable.",
        ],
      },
      {
        title: "Use an acceptance checklist tailored to text",
        paragraphs: [
          "Compare the original and candidate at the target size. Check thin text strokes, selected controls, colored status labels, and transparent edges. Confirm that cropping preserves the topic and that the downloadable file matches the format you intended. Record the actual byte difference.",
          "Use the PNG compressor to make a local candidate and inspect its preview before publishing. If a strict upload ceiling cannot be reached without damaging the labels, simplify the composition or split the content where the destination allows it. Preserve an original for future revision instead of repeatedly compressing the smallest current file.",
        ],
        table: {
          columns: ["Problem", "Better next experiment"],
          rows: [
            ["Already sharp but unnecessarily heavy", "Lossless optimization"],
            [
              "Whole desktop shrunk into unreadable text",
              "Focused crop or separate detail",
            ],
            ["Halos around letters", "Reject aggressive lossy settings"],
            ["Large empty margins", "Intentional crop with enough context"],
          ],
        },
      },
    ],
    sources: [
      {
        label: "MDN: PNG and other image formats",
        url: "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types",
      },
    ],
    related: [
      "gtmetrix-efficiently-encode-images",
      "compress-images-200kb-clarity",
      "images-cumulative-layout-shift",
    ],
    faqs: [
      {
        question: "Will PNG quality sliders always reduce the file?",
        answer:
          "PNG optimization differs from a photographic lossy quality workflow. Compare the actual tool path and output; do not assume the same control works identically for every format.",
      },
      {
        question: "Should tutorial text exist only inside an image?",
        answer:
          "No. Explain essential instructions in the article text and provide appropriate alternative text so the bitmap is not the only way to understand the procedure.",
      },
    ],
    imageAlt:
      "Conceptual illustration of a ceramic press beside large and compact image tiles",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/compress-png",
        label: "Optimize a PNG",
        description: "Prepare a PNG candidate and inspect text and transparent edges.",
      },
      {
        path: "/resize-image",
        label: "Resize an image",
        description:
          "Create a static candidate with dimensions that fit your intended display.",
      },
    ],
    seoTitle: "Compress PNG screenshots with sharp text",
  },
  {
    slug: "compress-images-200kb-clarity",
    title: "Get an image under 200 KB without making it unusable",
    description:
      "Meet a 200 KB upload limit by balancing dimensions, format, and visual clarity. Learn when quality alone cannot reach the target and how to verify the output.",
    category: "image-optimization",
    image: "compression",
    dek: "A byte ceiling is a constraint, not a quality setting. Decide which details must survive, check the destination’s exact rule, and search dimensions and encoding without promising impossible lossless savings.",
    summary: [
      "Confirm the destination’s format, dimensions, and byte rule.",
      "Start from an original and inspect the essential detail.",
      "Reduce dimensions when quality alone cannot meet the ceiling.",
    ],
    sections: [
      {
        title: "Read the upload requirements before choosing a target",
        paragraphs: [
          "Check the allowed file formats, minimum dimensions, aspect ratio, and exact file-size rule. A form asking for a JPEG portrait is a different task from a site accepting any image format. Do not solve a byte limit by exporting a file the destination rejects.",
          "Units can differ between systems. Inspect the actual output byte count and the destination’s documented threshold, and leave a little margin when the rule is unclear. A filename that says 200kb does not establish acceptance. Keep the original source so a later requirement change does not force you to work from a degraded derivative.",
        ],
      },
      {
        title: "Define the detail that must remain usable",
        paragraphs: [
          "For a photograph, check faces and important product markings. For a screenshot, check labels. For a document image, the destination may require readable text and a particular resolution. List these criteria before reducing the file so a smaller number does not become the only goal.",
          "Inspect the result at the size where it will actually be used. A candidate can look acceptable as a tiny preview while failing the destination’s review or display needs. If the image is used as a document, follow that service’s instructions rather than relying on a generic web-image recipe.",
        ],
      },
      {
        title: "Search from the original rather than recompressing repeatedly",
        paragraphs: [
          "Start each export from an untouched original or a single deliberate resized source. Repeated lossy exports can accumulate artifacts. A bounded target-size search compares actual encodes against a byte ceiling; it cannot predict the exact output from one quality number.",
          "CompressByURL’s target-size workflow tries measured candidates locally. The result depends on image content, format, and settings. A flat graphic and a textured photograph can produce very different byte counts with similar dimensions. Preserve the chosen settings and actual output size instead of assuming the same recipe works for the next image.",
        ],
      },
      {
        title: "Reduce excess dimensions before accepting extreme quality loss",
        paragraphs: [
          "If the destination allows smaller dimensions, a deliberate resize can reduce the amount of image information that needs encoding. Choose a width that still preserves the required content. A huge landscape photo used in a small profile slot may have far more pixels than the application needs.",
          "Keep minimum requirements in view. Do not reduce a document below readable size or force an incorrect crop. The right tradeoff is the smallest acceptable representation, not the smallest possible file. If the subject has fine texture, compare two dimension choices at sensible quality rather than using one huge image with severe artifacts.",
        ],
      },
      {
        title: "Respect format-specific limits and honest failure cases",
        paragraphs: [
          "Lossless optimization has less freedom to reduce a file than a workflow that changes pixels or uses lossy encoding. A complex PNG may not reach a strict target without resizing or conversion. If the required format is PNG and the required dimensions are fixed, the ceiling may simply be incompatible with that content.",
          "Do not treat a target as a guarantee. If the tool reports that it cannot meet the requested constraint, inspect what changes the destination permits. Keep the best usable candidate and choose a valid alternate workflow. An explicit failure is better than silently producing unreadable content or a file still over the limit.",
        ],
      },
      {
        title: "Verify the output file before submitting it",
        paragraphs: [
          "Open the downloaded file and check its dimensions, format, and bytes. Inspect the essential details against your criteria. Submit the actual output to the destination and read its validation message; local compression success and external acceptance are separate events.",
          "Use the 200 KB tool as a starting preset, then adjust only within the destination’s rules. Keep a small record of the accepted settings for future similar uploads. If the service rejects a file near the limit, check the exact rule and allow a margin rather than renaming it or repeatedly uploading the unchanged bytes.",
        ],
        table: {
          columns: ["Constraint", "Decision"],
          rows: [
            [
              "Fixed format and fixed dimensions",
              "Try valid encoding paths; accept possible failure",
            ],
            ["Dimensions can change", "Resize while preserving required detail"],
            ["Several formats accepted", "Compare actual outputs"],
            ["Unclear KB definition", "Check bytes and leave practical margin"],
          ],
        },
      },
    ],
    sources: [
      {
        label: "MDN: canvas export quality and file type behavior",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob",
      },
    ],
    related: [
      "how-target-size-compression-works",
      "compress-png-screenshots-sharp-text",
      "webp-bigger-than-jpeg",
    ],
    faqs: [
      {
        question: "Can every image be made smaller than 200 KB without visible loss?",
        answer:
          "No. Content, required dimensions, and allowed formats constrain what is possible. Some targets require resizing or lossy tradeoffs.",
      },
      {
        question: "Does the target tool upload my local file?",
        answer:
          "No. Local-file compression and the target search happen in your browser. You upload the downloaded result to the destination separately.",
      },
    ],
    imageAlt:
      "Conceptual illustration of a ceramic press beside large and compact image tiles",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/compress-image-to-200kb",
        label: "Try a 200 KB target",
        description:
          "Search for a usable candidate under a size ceiling, with honest failure cases.",
      },
      {
        path: "/resize-image",
        label: "Resize an image",
        description:
          "Create a static candidate with dimensions that fit your intended display.",
      },
    ],
    seoTitle: "Compress images to 200 KB with usable quality",
  },
  {
    slug: "image-url-cors-errors",
    title: "Why an image URL opens in your browser but fails to compress",
    description:
      "Diagnose CORS and canvas export failures, distinguish public image URLs from authenticated resources, and use a safe browser-first retrieval workflow.",
    category: "website-audits",
    image: "delivery",
    dek: "Seeing an image in a tab does not grant another website permission to read its pixels. Separate a normal image display from cross-origin processing before blaming the URL or trying unsafe proxy workarounds.",
    summary: [
      "Browser display and pixel access have different rules.",
      "Check public accessibility, redirects, and supported image content.",
      "Use local files or a bounded public retrieval path without sharing credentials.",
    ],
    sections: [
      {
        title: "Understand display access versus processing access",
        paragraphs: [
          "MDN explains that cross-origin images without the appropriate permission can taint a canvas. A page may display the image while export or pixel reading is blocked. That protects data across origins; it is not evidence that the photograph is corrupt.",
          "Confirm the failure stage. Did retrieval fail, decoding fail, or did export fail after drawing? Keep those stages separate in a developer error report. An ordinary navigation to the image URL establishes that your browser can display something under its current conditions, not that another site can safely retrieve and process the same bytes.",
        ],
      },
      {
        title: "Check whether the URL is a public image response",
        paragraphs: [
          "Open the intended direct resource and inspect its response through a workflow you control. A share-page URL can return HTML rather than an image. A signed URL can expire. A hotlink-protection rule can behave differently across request contexts. Record the final URL and actual content type when available.",
          "Avoid using a secret or token-bearing URL in a public diagnostic workflow. If the resource belongs to an authenticated account, download it through the service’s permitted workflow and use the local-file mode instead. Do not paste cookies, authorization headers, or credentials into a tool to imitate your logged-in session.",
        ],
      },
      {
        title: "Fix CORS at the source when you control the host",
        paragraphs: [
          "If you own the image host, configure the appropriate cross-origin policy for the processing application and verify the actual response. Client-side attributes alone cannot grant permission the server did not provide. Check redirects and cached responses because they can alter the final headers seen by the browser.",
          "Make the policy as specific as your use requires. Do not weaken access controls on private content simply to silence a development error. Public decorative assets and private user documents have different requirements. Test the expected processing origin and preserve normal authentication boundaries for protected resources.",
        ],
      },
      {
        title: "Use a narrowly scoped public-fetch fallback when needed",
        paragraphs: [
          "CompressByURL can retrieve validated public HTTP or HTTPS image resources through a limited server path when browser access is insufficient. The fetched bytes return to the browser for compression. This is a public image workflow, not a generic proxy or an authenticated session relay.",
          "The service checks destinations and redirects and enforces content, time, and byte budgets. Private network targets and unsafe responses can be rejected. A retrieval failure may therefore reflect a deliberate boundary rather than a CORS bug. Read the displayed error and choose a permitted local-file path when you have the right to download the source.",
        ],
      },
      {
        title: "Keep format and animation errors separate",
        paragraphs: [
          "A successful fetch still needs a supported static image that the browser and tool can decode. An HTML error response saved with an image extension is not a valid image. Animated content is outside CompressByURL’s optimization scope, even when it uses a familiar WebP or AVIF extension.",
          "Inspect the source independently if decoding fails. Preserve the original and avoid changing its extension as a supposed conversion. For an owned static image, try a known valid local file to distinguish retrieval from decoding. Use the error category to guide the next step rather than repeating the same URL without new evidence.",
        ],
      },
      {
        title: "Build a useful error report without exposing secrets",
        paragraphs: [
          "Record the public URL only when it is safe to share, the failure stage, browser information, and the visible error code. Remove private tokens and unrelated account data. A small description of whether the resource is public, redirects, and opens outside an authenticated session can narrow the investigation.",
          "If you simply need an optimized replacement for an image you own, download it normally and use Upload Files. Local bytes remain in your browser. If you need repeatable direct-URL processing, correct the source policy or use the bounded public workflow. Keep the destination public and supported rather than introducing a credential-forwarding workaround.",
        ],
        table: {
          columns: ["Observation", "Investigate"],
          rows: [
            ["Displays but canvas export fails", "Cross-origin pixel access policy"],
            ["URL returns a webpage", "Use the actual public image resource"],
            ["Works only when logged in", "Use an authorized download and local mode"],
            ["Public fetch rejected", "Destination, redirect, type, or budget boundary"],
          ],
        },
      },
    ],
    sources: [
      {
        label: "MDN: cross-origin images and tainted canvases",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image",
      },
      {
        label: "MDN: CORS guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS",
      },
    ],
    related: [
      "website-image-scanner-limitations",
      "find-large-images-on-a-website",
      "image-pagespeed-checklist",
    ],
    faqs: [
      {
        question: "Can I solve CORS by adding a client-side header?",
        answer:
          "The source server controls cross-origin permission. A client cannot grant itself access to protected remote pixels.",
      },
      {
        question: "Can the tool fetch my private intranet image?",
        answer:
          "No. Its server retrieval path is limited to safe public destinations. Use a permitted local download and browser compression instead.",
      },
    ],
    imageAlt:
      "Conceptual illustration of image tiles connected to a browser frame by a lavender ribbon",
    publishedOn: "2026-10-02",
    modifiedOn: "2026-10-02",
    toolLinks: [
      {
        path: "/compress-image-from-url",
        label: "Import a public image URL",
        description:
          "Retrieve a safe public static image, then process it in your browser.",
      },
      {
        path: "/compress-image",
        label: "Compress your images",
        description:
          "Compare measured output files while local image bytes stay in your browser.",
      },
    ],
    seoTitle: "Fix image URL CORS compression errors",
  },
  {
    slug: "webp-vs-avif-vs-jpeg",
    title: "WebP vs AVIF vs JPEG: choose by the image",
    description:
      "There is no permanently smallest format for every image. Start with the content, browser requirements and transparency needs, then compare outputs from the same source.",
    category: "image-optimization",
    image: "formats",
    imageAlt:
      "Conceptual illustration of three image tiles made from different translucent materials",
    publishedOn: "2026-09-14",
    modifiedOn: "2026-10-02",
    dek: "There is no permanently smallest format for every image. Start with the content, browser requirements and transparency needs, then compare outputs from the same source.",
    summary: [
      "JPEG is a safe photographic baseline without transparency.",
      "WebP is a balanced modern default with lossy, lossless and alpha-capable paths.",
      "AVIF is worth measuring when byte savings justify its encoding cost.",
    ],
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
      {
        title: "Use a comparison sheet instead of a universal winner",
        paragraphs: [
          "Start with one original and record the image’s intended use. A photograph in a hero, a transparent mark, and a screenshot inside a tutorial carry different requirements. Keep a checklist of the visible detail, maximum display width, transparency, and systems that need to read the result. That sheet prevents a smaller file from quietly breaking an important use.",
          "Export candidates from the same resized pixels. Record actual bytes and whether each passes visual review at the display size. Numeric quality scales are not interchangeable between encoders, so judge the result rather than matching slider positions. Keep the source original for another experiment. If the savings are marginal, choose the path your publishing system can deliver reliably.",
        ],
      },
      {
        title: "Verify the format decision in the deployed page",
        paragraphs: [
          "Check the public request after you publish a candidate. A converter output sitting on your computer has no effect on the page until its references change. Inspect srcset, picture sources, and any CDN transformation. A file extension is only a label; verify that the delivery path actually serves the intended output.",
          "Repeat the check in the important responsive layouts. A desktop photograph can be corrected while a mobile derivative still requests the old resource. Preserve alternative text and reserved geometry. Keep format choice as one part of the delivery decision alongside dimensions, loading, and visual quality. The finished comparison is the one your visitors actually receive.",
        ],
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
    related: [
      "webp-bigger-than-jpeg",
      "gtmetrix-next-gen-image-formats",
      "compress-png-screenshots-sharp-text",
    ],
    faqs: [],
    seoTitle: "WebP vs AVIF vs JPEG: practical format guide",
  },
  {
    slug: "how-target-size-compression-works",
    title: "How target-size image compression works",
    description:
      "A target such as 200 KB is a constraint, not a quality setting. A useful compressor searches for the best tested output under that ceiling and admits when quality alone cannot get there.",
    category: "image-optimization",
    image: "compression",
    imageAlt:
      "Conceptual illustration of a ceramic press beside large and compact image tiles",
    publishedOn: "2026-09-14",
    modifiedOn: "2026-10-02",
    dek: "A target such as 200 KB is a constraint, not a quality setting. A useful compressor searches for the best tested output under that ceiling and admits when quality alone cannot get there.",
    summary: [
      "Target size is verified from encoded bytes, not guessed from a slider.",
      "Bounded search keeps the highest tested quality that meets the ceiling.",
      "Dimension reduction is a separate, explicit fallback when quality is insufficient.",
    ],
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
      {
        title: "Write a destination-specific acceptance checklist",
        paragraphs: [
          "Before choosing a byte target, read the destination’s allowed format, minimum dimensions, and aspect ratio. A file that meets a byte ceiling but uses a rejected format is not a successful output. Inspect the exact downloaded byte count and allow a margin when the destination’s unit definition is unclear.",
          "Decide which visible details must remain useful. For a screenshot, inspect labels; for a product photograph, inspect markings and important texture. A tiny preview is not enough. Keep the untouched original and compare candidates at the real display size. The target search should stop at a usable output, not at any file small enough to satisfy arithmetic.",
        ],
      },
      {
        title: "Handle a target that conflicts with quality honestly",
        paragraphs: [
          "Some source images cannot meet a strict ceiling while keeping the required dimensions, format, and fidelity. A bounded search can establish the best candidate it found; it cannot promise that every constraint has a solution. If quality reduction is insufficient, consider dimensions only when the destination permits that change.",
          "Download and inspect the result before submitting it elsewhere. Local encoding success and the destination’s validation are separate checks. If the form rejects an output close to the limit, verify the rule and the actual bytes rather than renaming the file. Preserve accepted settings for future similar uploads, but do not assume a different image will produce the same size.",
        ],
      },
    ],
    sources: [
      {
        label: "MDN: canvas toBlob quality and output formats",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob",
      },
      {
        label: "MDN: Blob size in bytes",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Blob/size",
      },
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
    related: [
      "compress-images-200kb-clarity",
      "compress-png-screenshots-sharp-text",
      "webp-bigger-than-jpeg",
    ],
    faqs: [],
    seoTitle: "How target-size image compression works",
  },
  {
    slug: "find-large-images-on-a-website",
    title: "How to find large images on a website",
    description:
      "A useful audit separates transfer weight, intrinsic pixel dimensions and rendered size. One number cannot tell you whether an image is actually a problem.",
    category: "website-audits",
    image: "audit",
    imageAlt:
      "Conceptual illustration of a magnifying lens inspecting landscape image tiles",
    publishedOn: "2026-09-14",
    modifiedOn: "2026-10-02",
    dek: "A useful audit separates transfer weight, intrinsic pixel dimensions and rendered size. One number cannot tell you whether an image is actually a problem.",
    summary: [
      "Bytes, source pixels and rendered size answer different questions.",
      "Responsive candidates and device density prevent a simple one-to-one width rule.",
      "A static HTML scan finds candidates; runtime and field tools verify impact.",
    ],
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
      {
        title: "Prioritize an inventory by ownership and page use",
        paragraphs: [
          "A useful list names the component that references each resource and whether you can replace it. A first-party hero can require an asset and template change; a third-party widget can require configuration or removal. Separate those tasks rather than preparing a replacement bundle for resources your site does not control.",
          "Group variants of the same photograph and avoid counting every srcset candidate as a simultaneous browser download. Preserve alternate crops as distinct editorial uses. Start with important first-view assets and repeated oversized components, then work through less critical content. A prioritization label is a planning aid, not a measured Core Web Vitals severity score.",
        ],
      },
      {
        title: "Close the audit with a live-resource check",
        paragraphs: [
          "Record the page, viewport, selected source, observed bytes, and proposed change. A static scan can help discover URLs, but a browser confirms the resource selected for a particular layout. If the scanner cannot obtain a value, mark it unknown instead of zero. Keep limits and truncation information beside the result.",
          "After deploying the approved replacements, repeat the same navigation. Check the selected URLs and visible quality before comparing scores. A downloaded ZIP does not update the site. Document the template changes and preserve originals so a future content upload can follow the same standard rather than reintroducing the heavy source.",
        ],
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
    related: [
      "find-oversized-images-devtools",
      "website-image-scanner-limitations",
      "image-pagespeed-checklist",
    ],
    faqs: [],
    seoTitle: "How to find large images on a website",
  },
] as const satisfies readonly BlogArticle[];
