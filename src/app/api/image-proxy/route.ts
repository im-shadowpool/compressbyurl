import { NextResponse } from "next/server";
import { z } from "zod";

import { consumeRateLimit, requestClientKey } from "@/lib/security/rate-limit";
import {
  assertStaticImageResource,
  fetchPublicResource,
  IMAGE_FETCH_BUDGET,
  PublicFetchError,
  STATIC_IMAGE_CONTENT_TYPES,
} from "@/lib/security/public-http";

export const runtime = "nodejs";

const requestSchema = z.object({ url: z.string().min(1).max(4096) }).strict();

export async function POST(request: Request) {
  const rateLimit = consumeRateLimit(
    `image:${requestClientKey(request)}`,
    100,
    60 * 60 * 1000,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { code: "RATE_LIMITED", message: "Too many image requests. Try again later." },
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
      { code: "INVALID_REQUEST", message: "Enter one valid image URL." },
      { status: 400 },
    );
  }

  try {
    const result = await fetchPublicResource(parsed.data.url, {
      allowedContentTypes: STATIC_IMAGE_CONTENT_TYPES,
      contentTypeErrorMessage: "The remote resource is not a supported static image.",
      ...IMAGE_FETCH_BUDGET,
    });
    assertStaticImageResource(result.bytes, result.contentType);
    const body = new Uint8Array(result.bytes).buffer;
    return new Response(body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Length": String(result.bytes.byteLength),
        "Content-Type": result.contentType,
        "X-Content-Type-Options": "nosniff",
        "X-Source-URL": result.finalUrl,
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
      { code: "FETCH_FAILED", message: "The image could not be fetched safely." },
      { status: 502 },
    );
  }
}
