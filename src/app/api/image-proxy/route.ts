import { NextResponse } from "next/server";
import { z } from "zod";

import { consumeRateLimit, requestClientKey } from "@/lib/security/rate-limit";
import { fetchPublicResource, PublicFetchError } from "@/lib/security/public-http";
import { STATIC_IMAGE_MIME_TYPES } from "@/types/image";

export const runtime = "nodejs";

const requestSchema = z.object({ url: z.string().min(1).max(4096) }).strict();
const allowedImageTypes = new Set<string>(STATIC_IMAGE_MIME_TYPES);

export async function POST(request: Request) {
  const rateLimit = consumeRateLimit(
    `image:${requestClientKey(request)}`,
    30,
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
      allowedContentTypes: allowedImageTypes,
      contentTypeErrorMessage: "The remote resource is not a supported static image.",
      maxBytes: 25 * 1024 * 1024,
      maxRedirects: 4,
      timeoutMs: 10_000,
    });
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
