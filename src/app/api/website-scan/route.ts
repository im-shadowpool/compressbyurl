import { NextResponse } from "next/server";
import { z } from "zod";

import { extractWebsiteScanManifest } from "@/features/website-scan";
import { consumeRateLimit, requestClientKey } from "@/lib/security/rate-limit";
import {
  fetchPublicResource,
  HTML_CONTENT_TYPES,
  HTML_FETCH_BUDGET,
  PublicFetchError,
} from "@/lib/security/public-http";

export const runtime = "nodejs";

const requestSchema = z.object({ url: z.string().min(1).max(4096) }).strict();
const MAX_CANDIDATES = 80;

export async function POST(request: Request) {
  const rateLimit = consumeRateLimit(
    `scan:${requestClientKey(request)}`,
    12,
    60 * 60 * 1000,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { code: "RATE_LIMITED", message: "Too many scans. Try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_REQUEST", message: "A JSON request body is required." },
      { status: 400 },
    );
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "INVALID_REQUEST", message: "Enter one valid webpage URL." },
      { status: 400 },
    );
  }

  try {
    const resource = await fetchPublicResource(parsed.data.url, {
      allowedContentTypes: HTML_CONTENT_TYPES,
      contentTypeErrorMessage: "The URL did not return an HTML webpage.",
      ...HTML_FETCH_BUDGET,
    });
    const manifest = extractWebsiteScanManifest(
      new TextDecoder().decode(resource.bytes),
      resource.finalUrl,
      MAX_CANDIDATES,
    );
    return NextResponse.json(manifest, {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof PublicFetchError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { code: "SCAN_FAILED", message: "The webpage could not be scanned safely." },
      { status: 502 },
    );
  }
}
