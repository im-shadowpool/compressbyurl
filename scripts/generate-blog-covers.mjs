import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Original vector artwork. Each diagram explains the subject of its own article.
const covers = [
  ["fix-pagespeed-improve-image-delivery", ["Improve image", "delivery"], "delivery"],
  ["gtmetrix-properly-size-images", ["Size images", "for the screen"], "sizing"],
  ["gtmetrix-efficiently-encode-images", ["Fewer bytes.", "Clearer images."], "quality"],
  ["fix-lcp-image-resource-load-delay", ["Start the hero", "request sooner"], "timeline"],
  ["image-pagespeed-checklist", ["Your image", "audit checklist"], "checklist"],
  ["responsive-images-srcset-sizes", ["Responsive images", "that fit"], "responsive"],
  ["nextjs-image-sizes-too-large", ["Next.js Image", "Check sizes first"], "grid"],
  ["lcp-image-lazy-loading", ["Load the hero.", "Defer the rest."], "lazy"],
  ["images-cumulative-layout-shift", ["Reserve space.", "Stop the shift."], "layout"],
  ["css-background-image-lcp", ["A faster CSS", "background"], "layers"],
  ["gtmetrix-next-gen-image-formats", ["Deliver modern", "image formats"], "formats"],
  [
    "avoid-enormous-network-payloads-images",
    ["Less page weight.", "More useful pixels."],
    "payload",
  ],
  ["pagespeed-vs-gtmetrix-images", ["Two reports.", "One website."], "reports"],
  ["find-oversized-images-devtools", ["Find the image", "the browser chose"], "devtools"],
  [
    "website-image-scanner-limitations",
    ["What a scanner", "can actually see"],
    "scanner",
  ],
  [
    "wordpress-image-optimization-without-plugin",
    ["Lighter WordPress", "images"],
    "wordpress",
  ],
  ["webp-bigger-than-jpeg", ["When WebP", "gets bigger"], "bytes"],
  ["compress-png-screenshots-sharp-text", ["Small PNGs.", "Sharp text."], "pixels"],
  ["compress-images-200kb-clarity", ["Under 200 KB.", "Still useful."], "target"],
  ["image-url-cors-errors", ["An image URL", "meets CORS"], "cors"],
  ["webp-vs-avif-vs-jpeg", ["JPEG, WebP, AVIF", "Choose by the image"], "compare"],
  ["how-target-size-compression-works", ["How target-size", "search works"], "search"],
  ["find-large-images-on-a-website", ["Find your", "heaviest images"], "inventory"],
];

const ink = "#3c315b";
const accent = "#ab9ff2";
const white = "#fffdf8";
const pale = "#e2dffe";
const muted = "#675b7a";
const escape = (text) => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const rect = (x, y, w, h, fill = white, radius = 24) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${ink}" stroke-width="5"/>`;
const text = (x, y, value, size = 36, color = ink) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${escape(value)}</text>`;
const line = (x1, y1, x2, y2, color = ink, width = 7) =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
const arrow = (x1, y1, x2, y2) =>
  line(x1, y1, x2, y2) +
  `<path d="M${x2 - 18} ${y2 - 16}L${x2} ${y2}L${x2 - 18} ${y2 + 16}" fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
const picture = (x, y, w, h, fill = pale) =>
  rect(x, y, w, h, fill) +
  `<circle cx="${x + w * 0.75}" cy="${y + h * 0.28}" r="${Math.min(w, h) * 0.1}" fill="${white}"/>` +
  `<path d="M${x + 18} ${y + h - 18}L${x + w * 0.34} ${y + h * 0.42}L${x + w * 0.57} ${y + h * 0.69}L${x + w * 0.74} ${y + h * 0.5}L${x + w - 18} ${y + h - 18}Z" fill="${accent}"/>`;
const browser = (x, y, w, h) =>
  rect(x, y, w, h) +
  line(x, y + 55, x + w, y + 55) +
  [20, 40, 60]
    .map((dx) => `<circle cx="${x + dx}" cy="${y + 28}" r="5" fill="${ink}"/>`)
    .join("");
const label = (x, y, value, fill = pale, width = 220) =>
  rect(x, y, width, 64, fill, 32) + text(x + 24, y + 44, value, 30);

function diagram(kind) {
  switch (kind) {
    case "delivery":
      return (
        picture(105, 410, 350, 260) +
        arrow(495, 540, 705, 540) +
        browser(760, 375, 555, 355) +
        picture(815, 470, 440, 205) +
        label(155, 760, "SOURCE") +
        label(920, 760, "DELIVERED")
      );
    case "sizing":
      return (
        picture(115, 370, 600, 380) +
        picture(845, 485, 360, 230, accent) +
        arrow(735, 580, 805, 580) +
        text(140, 815, "SOURCE PIXELS", 34) +
        text(865, 785, "DISPLAY SLOT", 34)
      );
    case "quality":
      return (
        rect(120, 365, 1200, 455) +
        line(210, 725, 210, 435) +
        line(210, 725, 1230, 725) +
        `<path d="M230 460C500 450 615 660 1190 675" fill="none" stroke="${accent}" stroke-width="24"/>` +
        `<circle cx="750" cy="625" r="22" fill="${ink}"/>` +
        text(865, 500, "COMPARE", 42) +
        text(865, 550, "VISUAL QUALITY", 32) +
        text(250, 790, "ENCODE → MEASURE → REVIEW", 34)
      );
    case "timeline":
      return (
        ["HTML", "CSS", "HERO"]
          .map(
            (s, i) =>
              text(120, 450 + i * 135, s, 36) +
              rect(
                330 + i * 175,
                400 + i * 135,
                i === 2 ? 430 : 300,
                70,
                i === 2 ? accent : pale,
                16,
              ),
          )
          .join("") +
        line(330, 350, 330, 815, muted, 3) +
        arrow(660, 785, 1180, 785) +
        text(680, 850, "DISCOVER SOONER", 34)
      );
    case "checklist":
      return (
        rect(270, 345, 900, 500) +
        ["DIMENSIONS", "FORMAT + QUALITY", "LOADING", "LIVE REQUEST"]
          .map(
            (s, i) =>
              rect(325, 410 + i * 100, 50, 50, pale, 12) +
              `<path d="M337 ${437 + i * 100}l10 10 19-24" fill="none" stroke="${ink}" stroke-width="6"/>` +
              text(420, 450 + i * 100, s, 38),
          )
          .join("")
      );
    case "responsive":
      return (
        picture(115, 395, 550, 330) +
        picture(730, 475, 350, 250) +
        picture(1140, 540, 180, 185) +
        text(200, 805, "LARGE", 36) +
        text(820, 805, "MEDIUM", 36) +
        text(1160, 805, "SMALL", 30)
      );
    case "grid":
      return (
        browser(115, 365, 1210, 450) +
        [0, 1, 2].map((i) => picture(165 + i * 395, 465, 340, 230)).join("") +
        text(165, 775, "sizes = THE COLUMN WIDTH", 40)
      );
    case "lazy":
      return (
        browser(270, 350, 870, 500) +
        picture(330, 435, 430, 200) +
        label(825, 500, "EAGER", accent) +
        line(300, 675, 1110, 675, muted, 3) +
        [0, 1, 2].map((i) => rect(330 + i * 230, 715, 190, 90, pale, 16)).join("") +
        text(1040, 770, "LAZY", 32)
      );
    case "layout":
      return (
        browser(135, 360, 480, 450) +
        browser(825, 360, 480, 450) +
        rect(185, 450, 380, 225, pale) +
        picture(875, 450, 380, 225) +
        [0, 1]
          .map(
            (i) =>
              line(185, 730 + i * 35, 550, 730 + i * 35, muted, 9) +
              line(875, 730 + i * 35, 1240, 730 + i * 35, muted, 9),
          )
          .join("") +
        arrow(655, 575, 780, 575) +
        text(160, 870, "BEFORE LOAD", 32) +
        text(850, 870, "AFTER LOAD", 32)
      );
    case "layers":
      return (
        rect(230, 350, 620, 320, pale) +
        rect(420, 430, 620, 320, accent) +
        picture(610, 510, 620, 320) +
        text(265, 420, "HTML", 40) +
        text(455, 495, "CSS", 40) +
        text(655, 795, "BACKGROUND", 36)
      );
    case "formats":
      return ["JPEG", "WebP", "AVIF"]
        .map(
          (s, i) =>
            picture(110 + i * 445, 395, 390, 330, i === 1 ? accent : pale) +
            label(180 + i * 445, 765, s, white, 240),
        )
        .join("");
    case "payload":
      return (
        text(135, 425, "IMAGES", 38) +
        rect(360, 370, 915, 95, accent) +
        text(135, 565, "SCRIPTS", 38) +
        rect(360, 510, 535, 95, pale) +
        text(135, 705, "OTHER", 38) +
        rect(360, 650, 300, 95, white) +
        text(365, 830, "PRIORITIZE THE HEAVIEST ASSETS", 34)
      );
    case "reports":
      return (
        rect(145, 360, 495, 480) +
        rect(800, 360, 495, 480) +
        text(190, 435, "PageSpeed", 48) +
        text(850, 435, "GTmetrix", 48) +
        [0, 1, 2]
          .map(
            (i) =>
              rect(200, 490 + i * 95, 370 - i * 65, 50, pale, 12) +
              rect(855, 490 + i * 95, 280 + i * 35, 50, accent, 12),
          )
          .join("") +
        text(615, 650, "≠", 100)
      );
    case "devtools":
      return (
        browser(115, 355, 1210, 480) +
        picture(160, 450, 395, 290) +
        rect(620, 450, 650, 295, pale, 16) +
        text(660, 515, "currentSrc", 48) +
        text(660, 590, "SELECTED RESOURCE", 32) +
        text(660, 670, "SIZE • REQUEST • TIMING", 30) +
        line(610, 775, 1210, 775, accent, 20)
      );
    case "scanner":
      return (
        rect(130, 365, 510, 445) +
        rect(800, 365, 510, 445) +
        text(170, 435, "HTML SCAN", 43) +
        text(840, 435, "BROWSER", 43) +
        [0, 1, 2].map((i) => picture(180 + i * 135, 510, 105, 150)).join("") +
        picture(850, 485, 410, 240, accent) +
        text(175, 755, "CANDIDATE ASSETS", 30) +
        text(850, 775, "RENDERED PAGE", 30)
      );
    case "wordpress":
      return (
        browser(200, 350, 1040, 495) +
        picture(250, 450, 510, 305) +
        text(810, 505, "MEDIA", 45) +
        [0, 1, 2]
          .map((i) => line(815, 550 + i * 55, 1180 - i * 35, 550 + i * 55, muted, 12))
          .join("") +
        text(810, 760, "REPLACE + VERIFY", 28)
      );
    case "bytes":
      return (
        picture(130, 390, 325, 295) +
        text(505, 435, "JPEG", 40) +
        rect(505, 470, 540, 80, pale, 16) +
        text(505, 625, "WebP", 40) +
        rect(505, 660, 790, 80, accent, 16) +
        text(505, 835, "FORMAT ALONE IS NOT A SIZE GUARANTEE", 28)
      );
    case "pixels":
      return (
        rect(165, 350, 1110, 480) +
        text(230, 435, "SHARP TEXT", 58) +
        [0, 1, 2, 3]
          .map((row) =>
            [0, 1, 2, 3, 4, 5, 6]
              .map((col) =>
                rect(
                  235 + col * 68,
                  480 + row * 68,
                  58,
                  58,
                  (col + row) % 3 === 0 ? ink : accent,
                  3,
                ),
              )
              .join(""),
          )
          .join("") +
        text(800, 545, "PNG", 75) +
        text(805, 620, "LOSSLESS", 32) +
        text(805, 685, "DETAIL", 32)
      );
    case "target":
      return (
        `<circle cx="720" cy="580" r="220" fill="${white}" stroke="${ink}" stroke-width="7"/><path d="M510 630A220 220 0 1 1 927 647" fill="none" stroke="${accent}" stroke-width="32"/>` +
        text(545, 570, "200 KB", 84) +
        text(580, 635, "BYTE CEILING", 32) +
        picture(130, 470, 255, 250) +
        picture(1050, 500, 255, 210) +
        text(455, 875, "MEASURE THE DOWNLOADED FILE", 32)
      );
    case "cors":
      return (
        browser(115, 425, 400, 290) +
        rect(925, 425, 400, 290, pale) +
        text(175, 610, "BROWSER", 42) +
        text(995, 610, "SERVER", 42) +
        arrow(545, 560, 880, 560) +
        rect(670, 485, 105, 150, accent, 16) +
        text(625, 780, "CORS", 60) +
        text(475, 845, "ACCESS IS A SEPARATE CHECK", 30)
      );
    case "compare":
      return (
        ["PHOTO", "TRANSPARENCY", "DETAIL"]
          .map(
            (s, i) =>
              rect(115 + i * 445, 365, 385, 440, i === 1 ? pale : white) +
              picture(150 + i * 445, 410, 315, 230, i === 2 ? accent : pale) +
              text(150 + i * 445, 725, s, s.length > 10 ? 29 : 38),
          )
          .join("") + text(295, 875, "COMPARE THE SAME RESIZED SOURCE", 38)
      );
    case "search":
      return (
        rect(145, 370, 1150, 430) +
        line(240, 585, 1200, 585, muted, 5) +
        [0, 1, 2, 3, 4]
          .map(
            (i) =>
              `<circle cx="${260 + i * 230}" cy="585" r="${i === 3 ? 42 : 28}" fill="${i === 3 ? accent : pale}" stroke="${ink}" stroke-width="5"/>`,
          )
          .join("") +
        text(210, 480, "ENCODE", 38) +
        text(580, 480, "MEASURE", 38) +
        text(980, 480, "ADJUST", 38) +
        text(660, 730, "BEST TESTED PASS", 36)
      );
    case "inventory":
      return (
        browser(150, 350, 1140, 500) +
        [0, 1, 2]
          .map(
            (i) =>
              picture(200 + i * 350, 455, 295, 235) +
              rect(
                200 + i * 350,
                735,
                [255, 170, 100][i],
                55,
                i === 0 ? accent : pale,
                12,
              ),
          )
          .join("") +
        text(200, 905, "INVENTORY → PRIORITIZE → REPLACE", 36)
      );
    default:
      throw new Error(`Unknown diagram: ${kind}`);
  }
}

await mkdir("public/media/blog/covers", { recursive: true });
for (const [slug, title, kind] of covers) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="960" viewBox="0 0 1440 960" role="img" aria-labelledby="title"><title id="title">${escape(title.join(" "))}</title><rect width="1440" height="960" fill="${white}"/><rect x="40" y="310" width="1360" height="620" rx="32" fill="${kind === "cors" || kind === "reports" ? "#f4f2f4" : pale}" fill-opacity=".5"/><g font-family="Arial, sans-serif" font-weight="400">${text(80, 73, "COMPRESSBYURL / GUIDES", 26, muted)}${title.map((s, i) => text(80, 166 + i * 92, s, 80)).join("")}${diagram(kind)}</g></svg>`;
  await writeFile(`public/media/blog/covers/${slug}.svg`, svg);
  await sharp(Buffer.from(svg))
    .webp({ quality: 88 })
    .toFile(`public/media/blog/covers/${slug}.webp`);
}
console.log(`Created ${covers.length} unique illustrated covers with text.`);
