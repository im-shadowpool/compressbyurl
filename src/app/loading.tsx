import { Container } from "@/components/layout";

export default function Loading() {
  return (
    <main className="foundation-shell" aria-busy="true" aria-label="Loading">
      <Container size="content">
        <section className="foundation-card foundation-card-loading">
          <span className="loading-line loading-line-short" />
          <span className="loading-line loading-line-title" />
          <span className="loading-line loading-line-body" />
          <span className="loading-line loading-line-body loading-line-body-short" />
        </section>
      </Container>
    </main>
  );
}
