"use client";

import { useEffect } from "react";

import { Container } from "@/components/layout";
import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="foundation-shell">
      <Container size="content">
        <section className="foundation-card" role="alert" aria-labelledby="error-title">
          <p className="foundation-eyebrow">Something went sideways</p>
          <h1 className="foundation-title" id="error-title">
            We could not load this view.
          </h1>
          <p className="foundation-intro">
            Try again. Your local files stay on your device while CompressByURL is
            running.
          </p>
          <Button onClick={() => reset()}>Try again</Button>
        </section>
      </Container>
    </main>
  );
}
