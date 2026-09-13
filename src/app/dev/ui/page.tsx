import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout";
import { UiPrimitiveShowcase } from "@/features/foundation/ui-primitive-showcase";

export const metadata: Metadata = {
  title: "UI baseline",
  robots: { index: false, follow: false },
};

export default function UiBaselinePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="ui-baseline-page">
      <Container>
        <header className="ui-baseline-header">
          <p>Phase 3 visual baseline</p>
          <h1>Core UI primitives</h1>
          <span>
            Stable examples for component review. This route is available in development
            only.
          </span>
        </header>
        <UiPrimitiveShowcase />
      </Container>
    </main>
  );
}
