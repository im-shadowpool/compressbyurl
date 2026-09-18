"use client";

import { Container } from "@/components/layout";
import { Button } from "@/components/ui";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="foundation-shell">
          <Container size="content">
            <section
              className="foundation-card"
              role="alert"
              aria-labelledby="global-error-title"
            >
              <p className="foundation-eyebrow">CompressByURL</p>
              <h1 className="foundation-title" id="global-error-title">
                A fresh start should fix this.
              </h1>
              <p className="foundation-intro">The app hit an unexpected problem.</p>
              <Button onClick={() => reset()}>Reload workspace</Button>
            </section>
          </Container>
        </main>
      </body>
    </html>
  );
}
