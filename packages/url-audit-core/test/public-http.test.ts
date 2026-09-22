import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import test, { after, before } from "node:test";

import {
  assertStaticImageResource,
  fetchPublicResource,
  PublicFetchError,
} from "../src/public-http.js";

let server: Server;
let origin: string;

before(async () => {
  server = createServer((request, response) => {
    switch (request.url) {
      case "/ok":
        response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        response.end("<title>Fixture</title>");
        return;
      case "/wrong-type":
        response.writeHead(200, { "content-type": "text/plain" });
        response.end("not html");
        return;
      case "/declared-large":
        response.writeHead(200, {
          "content-length": "10000",
          "content-type": "text/html",
        });
        response.end("short");
        return;
      case "/chunked-large":
        response.writeHead(200, { "content-type": "text/html" });
        response.write("12345678");
        response.end("abcdefgh");
        return;
      case "/redirect-private":
        response.writeHead(302, {
          location: "http://169.254.169.254/latest/meta-data",
        });
        response.end();
        return;
      case "/redirect-loop":
        response.writeHead(302, { location: "/redirect-loop" });
        response.end();
        return;
      case "/slow":
        setTimeout(() => {
          if (response.destroyed) return;
          response.writeHead(200, { "content-type": "text/html" });
          response.end("late");
        }, 150);
        return;
      default:
        response.writeHead(404);
        response.end();
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing fixture address");
  origin = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

function options(overrides: Partial<Parameters<typeof fetchPublicResource>[1]> = {}) {
  return {
    addressPolicy: "public-and-loopback" as const,
    allowedContentTypes: new Set(["text/html"]),
    maxBytes: 1024,
    maxRedirects: 2,
    timeoutMs: 1_000,
    ...overrides,
  };
}

async function expectCode(promise: Promise<unknown>, code: string) {
  await assert.rejects(
    promise,
    (error) => error instanceof PublicFetchError && error.code === code,
  );
}

test("fetches allowed content through a pinned loopback fixture", async () => {
  const result = await fetchPublicResource(`${origin}/ok#fragment`, options());

  assert.equal(new TextDecoder().decode(result.bytes), "<title>Fixture</title>");
  assert.equal(result.contentType, "text/html");
  assert.equal(result.finalUrl, `${origin}/ok`);
});

test("public-only mode blocks the same loopback fixture", async () => {
  await expectCode(
    fetchPublicResource(`${origin}/ok`, {
      ...options(),
      addressPolicy: "public-only",
    }),
    "UNSAFE_DESTINATION",
  );
});

test("allows localhost only when the operator enables loopback", async () => {
  const localhostOrigin = origin.replace("127.0.0.1", "localhost");
  const result = await fetchPublicResource(`${localhostOrigin}/ok`, options());
  assert.equal(result.contentType, "text/html");

  await expectCode(
    fetchPublicResource(`${localhostOrigin}/ok`, {
      ...options(),
      addressPolicy: "public-only",
    }),
    "UNSAFE_DESTINATION",
  );
});

test("pins the validated DNS address for the outbound connection", async () => {
  const port = new URL(origin).port;
  let lookups = 0;
  const result = await fetchPublicResource(
    `http://rebind.invalid:${port}/ok`,
    options(),
    async (hostname) => {
      assert.equal(hostname, "rebind.invalid");
      lookups += 1;
      return [{ address: "127.0.0.1", family: 4 }];
    },
  );

  assert.equal(result.contentType, "text/html");
  assert.equal(lookups, 1);
});

test("rejects malformed URLs, credentials, and unsupported schemes", async () => {
  await expectCode(fetchPublicResource("not a URL", options()), "INVALID_URL");
  await expectCode(
    fetchPublicResource("http://user:pass@example.com/", options()),
    "INVALID_URL",
  );
  await expectCode(fetchPublicResource("file:///etc/passwd", options()), "INVALID_URL");
});

test("blocks unsupported content types", async () => {
  await expectCode(
    fetchPublicResource(`${origin}/wrong-type`, options()),
    "UNSUPPORTED_CONTENT_TYPE",
  );
});

test("blocks declared and streamed bodies over the byte limit", async () => {
  await expectCode(
    fetchPublicResource(`${origin}/declared-large`, options({ maxBytes: 8 })),
    "RESPONSE_TOO_LARGE",
  );
  await expectCode(
    fetchPublicResource(`${origin}/chunked-large`, options({ maxBytes: 8 })),
    "RESPONSE_TOO_LARGE",
  );
});

test("revalidates redirect destinations and redirect limits", async () => {
  await expectCode(
    fetchPublicResource(`${origin}/redirect-private`, options()),
    "UNSAFE_DESTINATION",
  );
  await expectCode(
    fetchPublicResource(`${origin}/redirect-loop`, options({ maxRedirects: 1 })),
    "TOO_MANY_REDIRECTS",
  );
});

test("enforces the overall request deadline", async () => {
  await expectCode(
    fetchPublicResource(`${origin}/slow`, options({ timeoutMs: 25 })),
    "TIMEOUT",
  );
});

test("rejects image MIME spoofing after transport validation", () => {
  assert.throws(
    () => assertStaticImageResource(new TextEncoder().encode("not a png"), "image/png"),
    (error) => error instanceof PublicFetchError && error.code === "SIGNATURE_MISMATCH",
  );
});
