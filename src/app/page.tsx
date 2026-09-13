import { MaterialSymbol } from "@/components/icons";
import { Container } from "@/components/layout";
import { SiteFooter, SiteHeader } from "@/components/shell";
import { ToolModeSwitcher } from "@/features/tool-shell";

export default function HomePage() {
  return (
    <div className="home-page">
      <SiteHeader />
      <main>
        <section className="home-hero" aria-labelledby="page-title">
          <Container>
            <div className="home-hero__frame">
              <div className="home-hero__copy motion-safe-enter">
                <p className="home-hero__eyebrow">
                  <MaterialSymbol name="bolt" size={20} />
                  Private image compression
                </p>
                <h1 id="page-title">Compress images from files or URLs.</h1>
                <p>Make images smaller, convert formats and fix heavy webpage assets.</p>
              </div>
              <div className="home-hero__tool motion-safe-enter">
                <ToolModeSwitcher />
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
