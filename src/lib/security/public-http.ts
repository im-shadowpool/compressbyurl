import { lookup } from "node:dns/promises";

import ipaddr from "ipaddr.js";
import { Agent, fetch as undiciFetch, type Dispatcher } from "undici";

export type PublicFetchErrorCode =
  | "INVALID_URL"
  | "UNSAFE_DESTINATION"
  | "DNS_FAILED"
  | "FETCH_FAILED"
  | "TOO_MANY_REDIRECTS"
  | "RESPONSE_TOO_LARGE"
  | "UNSUPPORTED_CONTENT_TYPE"
  | "UPSTREAM_ERROR"
  | "TIMEOUT";

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
  allowedContentTypes: ReadonlySet<string>;
  contentTypeErrorMessage?: string;
  maxBytes: number;
  maxRedirects: number;
  timeoutMs: number;
}

export interface PublicFetchResult {
  bytes: Uint8Array;
  contentType: string;
  finalUrl: string;
}

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

function assertPublicAddress(address: string) {
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

  if (parsed.range() !== "unicast") {
    throw new PublicFetchError(
      "UNSAFE_DESTINATION",
      "Private, local, reserved and metadata destinations are blocked.",
    );
  }
}

async function resolvePublicAddress(hostname: string) {
  const host = normalizedHostname(hostname);
  if (host.toLowerCase() === "localhost" || host.toLowerCase().endsWith(".localhost")) {
    throw new PublicFetchError("UNSAFE_DESTINATION", "Local destinations are blocked.");
  }

  if (ipaddr.isValid(host)) {
    assertPublicAddress(host);
    const parsed = ipaddr.parse(host);
    return { address: host, family: parsed.kind() === "ipv4" ? 4 : 6 } as const;
  }

  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new PublicFetchError(
      "DNS_FAILED",
      "The public hostname could not be resolved.",
    );
  }
  if (addresses.length === 0) {
    throw new PublicFetchError("DNS_FAILED", "The public hostname has no addresses.");
  }
  addresses.forEach(({ address }) => assertPublicAddress(address));
  return addresses.find(({ family }) => family === 4) ?? addresses[0];
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
): Promise<PublicFetchResult> {
  let currentUrl = normalizedUrl(input);
  const deadline = Date.now() + options.timeoutMs;

  for (let redirectCount = 0; redirectCount <= options.maxRedirects; redirectCount += 1) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      throw new PublicFetchError("TIMEOUT", "The remote request timed out.", 504);
    }

    const resolved = await resolvePublicAddress(currentUrl.hostname);
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
        signal: AbortSignal.timeout(remainingMs),
      });
    } catch (error) {
      await dispatcher.close();
      if (error instanceof PublicFetchError) throw error;
      if (error instanceof DOMException && error.name === "TimeoutError") {
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
