import type { Metadata } from "next";
import Link from "next/link";

import { MaterialSymbol } from "@/components/icons";
import { Container } from "@/components/layout";
import { MediaFrame } from "@/components/media";
import { HomeStructuredData } from "@/components/seo/home-structured-data";
import { SiteFooter, SiteHeader } from "@/components/shell";
import { createSeoMetadata } from "@/config/seo-routes";
import { ToolModeSwitcher } from "@/features/tool-shell";
import { media } from "@/lib/media";

export const metadata: Metadata = createSeoMetadata("/");

export default function HomePage() {
  return (
    <div className="home-page">
      <SiteHeader />
      <main>
        <section className="home-hero" aria-labelledby="page-title">
          <Container size="bleed">
            <div className="home-hero__frame">
              <div className="home-hero__top">
                <div className="home-hero__copy motion-safe-enter">
                  <h1 id="page-title">Compress images from files or URLs.</h1>
                  <p>
                    Make images smaller, convert formats and fix heavy webpage assets.
                  </p>
                </div>
                <MediaFrame
                  asset={media.hero.optimizer}
                  className="home-hero__media motion-safe-enter"
                  priority
                  sizes="(max-width: 768px) 92vw, 44vw"
                />
              </div>
              <div
                className="home-hero__tool motion-safe-enter"
                style={{ animationDelay: "80ms" }}
              >
                <ToolModeSwitcher />
              </div>
            </div>
          </Container>
        </section>
        <section
          className="home-capabilities"
          id="how-it-works"
          aria-labelledby="capabilities-title"
        >
          <Container>
            <div className="home-capabilities__intro">
              <h2 id="capabilities-title">
                One optimization engine, wherever your image starts.
              </h2>
              <p>
                Use files already on your device, fetch one public image URL, or scan a
                webpage for image candidates. Compression, conversion, resizing and
                downloads still happen in your browser after an image is selected.
              </p>
            </div>
            <div className="home-capabilities__modes">
              <article>
                <MediaFrame
                  asset={media.features.batch}
                  className="home-capabilities__media"
                  sizes="(max-width: 768px) 38vw, 18vw"
                />
                <div>
                  <MaterialSymbol name="upload_file" size={24} />
                  <h3>Upload files</h3>
                  <p>
                    Compress batches of JPEG, PNG, WebP and static AVIF images without
                    sending local file bytes to the server.
                  </p>
                  <Link href="/compress-image">Open the compressor</Link>
                </div>
              </article>
              <article>
                <MediaFrame
                  asset={media.features.delivery}
                  className="home-capabilities__media"
                  sizes="(max-width: 768px) 38vw, 18vw"
                />
                <div>
                  <MaterialSymbol name="link" size={24} />
                  <h3>Use an image URL</h3>
                  <p>
                    Import one public image, then apply the same local quality, format,
                    resize, naming and target-size controls.
                  </p>
                  <Link href="/compress-image-from-url">Open the URL tool</Link>
                </div>
              </article>
              <article>
                <MediaFrame
                  asset={media.features.website}
                  className="home-capabilities__media"
                  sizes="(max-width: 768px) 62vw, 22vw"
                />
                <div>
                  <MaterialSymbol name="travel_explore" size={24} />
                  <h3>Scan a webpage</h3>
                  <p>
                    Find discoverable image candidates on one public page, select the
                    useful ones and create a local replacement bundle.
                  </p>
                  <Link href="/website-image-scanner">Open the scanner</Link>
                </div>
              </article>
            </div>
          </Container>
        </section>
        <section className="home-privacy" id="privacy" aria-labelledby="privacy-title">
          <Container>
            <div className="home-privacy__frame">
              <div>
                <MaterialSymbol name="shield_lock" size={32} />
                <h2 id="privacy-title">Your local images stay local.</h2>
              </div>
              <div className="home-privacy__copy">
                <p>
                  Upload mode decodes, resizes, compresses, converts and packages images
                  on your device. Local filenames, pixels and metadata are not sent to our
                  server for processing.
                </p>
                <p>
                  URL modes make limited network requests because remote resources must be
                  fetched. Private networks are blocked, redirects and content types are
                  checked, and fetched images return to the browser for optimization.
                </p>
              </div>
              <dl className="home-privacy__facts">
                <div>
                  <dt>Static formats</dt>
                  <dd>JPEG · PNG · WebP · AVIF</dd>
                </div>
                <div>
                  <dt>Local workflow</dt>
                  <dd>Compress · resize · convert · ZIP</dd>
                </div>
                <div>
                  <dt>URL scope</dt>
                  <dd>One image or one webpage at a time</dd>
                </div>
              </dl>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
      <HomeStructuredData />
    </div>
  );
}
