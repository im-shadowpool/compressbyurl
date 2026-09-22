import { lookup } from "node:dns/promises";

import ipaddr from "ipaddr.js";
import { Agent, fetch as undiciFetch, type Dispatcher } from "undici";

import { inspectStaticImageSignature } from "./image-signature.js";

export type PublicFetchErrorCode =
  | "INVALID_URL"
  | "UNSAFE_DESTINATION"
  | "DNS_FAILED"
  | "FETCH_FAILED"
  | "TOO_MANY_REDIRECTS"
  | "RESPONSE_TOO_LARGE"
  | "UNSUPPORTED_CONTENT_TYPE"
  | "SIGNATURE_MISMATCH"
  | "ANIMATED_IMAGE"
  | "UPSTREAM_ERROR"
  | "TIMEOUT"
  | "CANCELLED";

export type AddressPolicy = "public-only" | "public-and-loopback";

export class PublicFetchError extends Error {
  constructor(
    public readonly code: PublicFetchErrorCode,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "PublicFetchError";
  }
}

export interface PublicFetchOptions {
  addressPolicy?: AddressPolicy;
  allowedContentTypes: ReadonlySet<string>;
  contentTypeErrorMessage?: string;
  maxBytes: number;
  maxRedirects: number;
  signal?: AbortSignal;
  timeoutMs: number;
}

export interface PublicFetchResult {
  bytes: Uint8Array;
  contentType: string;
  finalUrl: string;
}

type HostnameLookup = (
  hostname: string,
) => Promise<Array<{ address: string; family: number }>>;

const systemHostnameLookup: HostnameLookup = (hostname) =>
  lookup(hostname, { all: true, verbatim: true });

export const HTML_FETCH_BUDGET = {
  maxBytes: 2 * 1024 * 1024,
  maxRedirects: 4,
  timeoutMs: 10_000,
} as const;

export const IMAGE_FETCH_BUDGET = {
  maxBytes: 25 * 1024 * 1024,
  maxRedirects: 4,
  timeoutMs: 10_000,
} as const;

export const HTML_CONTENT_TYPES = new Set(["text/html", "application/xhtml+xml"]);

export const STATIC_IMAGE_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function normalizedUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new PublicFetchError("INVALID_URL", "Enter a complete HTTP or HTTPS URL.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new PublicFetchError(
      "INVALID_URL",
      "Only public HTTP or HTTPS URLs without embedded credentials are allowed.",
    );
  }
  url.hash = "";
  return url;
}

function normalizedHostname(hostname: string) {
  return hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : hostname;
}

export function assertAllowedAddress(
  address: string,
  policy: AddressPolicy = "public-only",
) {
  let parsed: ipaddr.IPv4 | ipaddr.IPv6;
  try {
    parsed = ipaddr.parse(address);
  } catch {
    throw new PublicFetchError("DNS_FAILED", "The destination address is invalid.");
  }

  if (parsed.kind() === "ipv6" && (parsed as ipaddr.IPv6).isIPv4MappedAddress()) {
    throw new PublicFetchError(
      "UNSAFE_DESTINATION",
      "IPv4-mapped IPv6 destinations are not allowed.",
    );
  }

  const range = parsed.range();
  if (range === "unicast" || (range === "loopback" && policy === "public-and-loopback")) {
    return;
  }

  throw new PublicFetchError(
    "UNSAFE_DESTINATION",
    "Private, local, reserved and metadata destinations are blocked.",
  );
}

async function resolveAllowedAddress(
  hostname: string,
  policy: AddressPolicy,
  deadline: number,
  lookupHostname: HostnameLookup,
) {
  const host = normalizedHostname(hostname);
  const lowerHost = host.toLowerCase();
  if (
    (lowerHost === "localhost" || lowerHost.endsWith(".localhost")) &&
    policy !== "public-and-loopback"
  ) {
    throw new PublicFetchError("UNSAFE_DESTINATION", "Local destinations are blocked.");
  }

  if (ipaddr.isValid(host)) {
    assertAllowedAddress(host, policy);
    const parsed = ipaddr.parse(host);
    return { address: host, family: parsed.kind() === "ipv4" ? 4 : 6 } as const;
  }

  let addresses: Array<{ address: string; family: number }>;
  const remainingMs = deadline - Date.now();
  if (remainingMs <= 0) {
    throw new PublicFetchError("TIMEOUT", "The remote request timed out.", 504);
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    addresses = await Promise.race([
      lookupHostname(host),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(new PublicFetchError("TIMEOUT", "The remote request timed out.", 504)),
          remainingMs,
        );
      }),
    ]);
  } catch (error) {
    if (error instanceof PublicFetchError) throw error;
    throw new PublicFetchError(
      "DNS_FAILED",
      "The public hostname could not be resolved.",
    );
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (addresses.length === 0) {
    throw new PublicFetchError("DNS_FAILED", "The public hostname has no addresses.");
  }
  addresses.forEach(({ address }) => assertAllowedAddress(address, policy));
  const resolved = addresses.find(({ family }) => family === 4) ?? addresses[0];
  if (!resolved) {
    throw new PublicFetchError("DNS_FAILED", "The public hostname has no addresses.");
  }
  return resolved;
}

async function readLimitedBody(
  response: Awaited<ReturnType<typeof undiciFetch>>,
  maxBytes: number,
) {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new PublicFetchError(
      "RESPONSE_TOO_LARGE",
      `The remote response exceeds the ${Math.round(maxBytes / 1024 / 1024)} MB limit.`,
      413,
    );
  }
  if (!response.body) {
    throw new PublicFetchError(
      "FETCH_FAILED",
      "The remote server returned no body.",
      502,
    );
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new PublicFetchError(
        "RESPONSE_TOO_LARGE",
        `The remote response exceeds the ${Math.round(maxBytes / 1024 / 1024)} MB limit.`,
        413,
      );
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function fetchPublicResource(
  input: string,
  options: PublicFetchOptions,
  lookupHostname: HostnameLookup = systemHostnameLookup,
): Promise<PublicFetchResult> {
  if (options.signal?.aborted) {
    throw new PublicFetchError("CANCELLED", "The request was cancelled.", 499);
  }
  if (
    !Number.isInteger(options.maxBytes) ||
    options.maxBytes <= 0 ||
    !Number.isInteger(options.maxRedirects) ||
    options.maxRedirects < 0 ||
    !Number.isInteger(options.timeoutMs) ||
    options.timeoutMs <= 0
  ) {
    throw new PublicFetchError("INVALID_URL", "The fetch limits are invalid.");
  }

  let currentUrl = normalizedUrl(input);
  const deadline = Date.now() + options.timeoutMs;
  const addressPolicy = options.addressPolicy ?? "public-only";

  for (let redirectCount = 0; redirectCount <= options.maxRedirects; redirectCount += 1) {
    const beforeResolveMs = deadline - Date.now();
    if (beforeResolveMs <= 0) {
      throw new PublicFetchError("TIMEOUT", "The remote request timed out.", 504);
    }

    const resolved = await resolveAllowedAddress(
      currentUrl.hostname,
      addressPolicy,
      deadline,
      lookupHostname,
    );
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      throw new PublicFetchError("TIMEOUT", "The remote request timed out.", 504);
    }

    const dispatcher: Dispatcher = new Agent({
      connect: {
        lookup: (_hostname, lookupOptions, callback) => {
          if (lookupOptions.all) {
            callback(null, [resolved]);
          } else {
            callback(null, resolved.address, resolved.family);
          }
        },
      },
    });

    let response: Awaited<ReturnType<typeof undiciFetch>>;
    try {
      response = await undiciFetch(currentUrl, {
        cache: "no-store",
        credentials: "omit",
        dispatcher,
        headers: {
          accept: Array.from(options.allowedContentTypes).join(", "),
          "user-agent": "CompressByURL/1.0 (+public-image-fetch)",
        },
        redirect: "manual",
        signal: options.signal
          ? AbortSignal.any([options.signal, AbortSignal.timeout(remainingMs)])
          : AbortSignal.timeout(remainingMs),
      });
    } catch (error) {
      await dispatcher.close();
      if (error instanceof PublicFetchError) throw error;
      if (options.signal?.aborted) {
        throw new PublicFetchError("CANCELLED", "The request was cancelled.", 499);
      }
      if (
        (error instanceof DOMException && error.name === "TimeoutError") ||
        (error instanceof Error && error.name === "TimeoutError")
      ) {
        throw new PublicFetchError("TIMEOUT", "The remote request timed out.", 504);
      }
      throw new PublicFetchError(
        "FETCH_FAILED",
        "The remote resource could not be fetched.",
        502,
      );
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await dispatcher.close();
      if (!location) {
        throw new PublicFetchError(
          "UPSTREAM_ERROR",
          "The remote redirect was incomplete.",
          502,
        );
      }
      if (redirectCount === options.maxRedirects) {
        throw new PublicFetchError(
          "TOO_MANY_REDIRECTS",
          "The remote URL redirected too many times.",
          502,
        );
      }
      currentUrl = normalizedUrl(new URL(location, currentUrl).toString());
      continue;
    }

    if (!response.ok) {
      await dispatcher.close();
      throw new PublicFetchError(
        "UPSTREAM_ERROR",
        `The remote server returned HTTP ${response.status}.`,
        502,
      );
    }

    const contentType = response.headers
      .get("content-type")
      ?.split(";")[0]
      ?.trim()
      .toLowerCase();
    if (!contentType || !options.allowedContentTypes.has(contentType)) {
      await dispatcher.close();
      throw new PublicFetchError(
        "UNSUPPORTED_CONTENT_TYPE",
        options.contentTypeErrorMessage ?? "The remote content type is not allowed.",
        415,
      );
    }

    try {
      const bytes = await readLimitedBody(response, options.maxBytes);
      return { bytes, contentType, finalUrl: currentUrl.toString() };
    } finally {
      await dispatcher.close();
    }
  }

  throw new PublicFetchError(
    "TOO_MANY_REDIRECTS",
    "The remote URL redirected too many times.",
    502,
  );
}

export function assertStaticImageResource(
  bytes: Uint8Array,
  declaredContentType: string,
) {
  const signature = inspectStaticImageSignature(bytes.subarray(0, 256 * 1024));
  if (!signature || signature.mimeType !== declaredContentType) {
    throw new PublicFetchError(
      "SIGNATURE_MISMATCH",
      "The remote image bytes do not match the declared content type.",
      415,
    );
  }
  if (signature.animated) {
    throw new PublicFetchError(
      "ANIMATED_IMAGE",
      "Animated images are not supported.",
      415,
    );
  }
  return signature;
}
