import { Container } from "@/components/layout";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="foundation-shell">
      <Container size="content">
        <section className="foundation-card" aria-labelledby="not-found-title">
          <p className="foundation-eyebrow">404</p>
          <h1 className="foundation-title" id="not-found-title">
            That page is not in the workspace.
          </h1>
          <p className="foundation-intro">
            Head back to the starting point and keep making things lighter.
          </p>
          <ButtonLink href="/">Back home</ButtonLink>
        </section>
      </Container>
    </main>
  );
}
