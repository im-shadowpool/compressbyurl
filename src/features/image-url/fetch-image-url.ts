import ipaddr from "ipaddr.js";

import { STATIC_IMAGE_MIME_TYPES, type StaticImageMimeType } from "@/types/image";

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const supportedTypes = new Set<string>(STATIC_IMAGE_MIME_TYPES);

export type ImageUrlFetchMethod = "direct" | "secure-proxy";

export interface ImageUrlFetchResult {
  file: File;
  finalUrl: string;
  method: ImageUrlFetchMethod;
}

export class ImageUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUrlError";
  }
}

export function normalizeImageUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new ImageUrlError(
      "Enter a complete image URL beginning with http:// or https://.",
    );
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new ImageUrlError(
      "Only public HTTP or HTTPS URLs without sign-in details are allowed.",
    );
  }
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new ImageUrlError("Local and private destinations are not allowed.");
  }
  const address = hostname.startsWith("[") ? hostname.slice(1, -1) : hostname;
  if (ipaddr.isValid(address)) {
    const parsed = ipaddr.parse(address);
    if (
      parsed.range() !== "unicast" ||
      (parsed.kind() === "ipv6" && (parsed as ipaddr.IPv6).isIPv4MappedAddress())
    ) {
      throw new ImageUrlError(
        "Local, private and reserved destinations are not allowed.",
      );
    }
  }
  url.hash = "";
  return url.toString();
}

function extensionForMime(mime: StaticImageMimeType) {
  if (mime === "image/jpeg") return "jpg";
  return mime.slice("image/".length);
}

function filenameFromUrl(value: string, mime: StaticImageMimeType) {
  const rawSegment =
    new URL(value).pathname.split("/").filter(Boolean).at(-1) ?? "remote-image";
  let decoded = rawSegment;
  try {
    decoded = decodeURIComponent(rawSegment);
  } catch {
    // Keep the encoded segment when malformed escapes are present.
  }
  const safe = decoded
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 120);
  const stem = safe.replace(/\.(?:jpe?g|png|webp|avif)$/i, "") || "remote-image";
  return `${stem}.${extensionForMime(mime)}`;
}

async function responseToFile(response: Response, sourceUrl: string) {
  if (!response.ok) {
    throw new ImageUrlError(`The image server returned HTTP ${response.status}.`);
  }
  const contentType = response.headers
    .get("content-type")
    ?.split(";")[0]
    ?.trim()
    .toLowerCase();
  if (!contentType || !supportedTypes.has(contentType)) {
    throw new ImageUrlError("The URL did not return a supported static image.");
  }
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES) {
    throw new ImageUrlError("The image is larger than the 25 MB URL import limit.");
  }
  const blob = await response.blob();
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new ImageUrlError("The image is larger than the 25 MB URL import limit.");
  }
  const mime = contentType as StaticImageMimeType;
  return new File([blob], filenameFromUrl(sourceUrl, mime), {
    type: mime,
    lastModified: Date.now(),
  });
}

export async function fetchImageUrl(value: string): Promise<ImageUrlFetchResult> {
  const normalized = normalizeImageUrl(value);

  try {
    const response = await fetch(normalized, {
      cache: "no-store",
      credentials: "omit",
      mode: "cors",
      redirect: "follow",
    });
    const file = await responseToFile(response, response.url || normalized);
    return { file, finalUrl: response.url || normalized, method: "direct" };
  } catch {
    // CORS and network failures use the same strictly validated server fallback.
  }

  const response = await fetch("/api/image-proxy", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: normalized }),
  });
  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message =
      typeof errorBody === "object" &&
      errorBody !== null &&
      "message" in errorBody &&
      typeof errorBody.message === "string"
        ? errorBody.message
        : "The image could not be fetched safely.";
    throw new ImageUrlError(message);
  }
  const finalUrl = response.headers.get("x-source-url") || normalized;
  const file = await responseToFile(response, finalUrl);
  return { file, finalUrl, method: "secure-proxy" };
}
