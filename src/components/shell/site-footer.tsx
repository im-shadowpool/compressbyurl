import Link from "next/link";

import { CookieSettingsButton } from "@/components/analytics/cookie-settings-button";
import { Container } from "@/components/layout";
import { MediaFrame } from "@/components/media";
import { ButtonLink } from "@/components/ui";
import { media } from "@/lib/media";

import { BrandLogo } from "./brand-logo";

const footerLinks = [
  { label: "Blog", href: "/learn" },
  { label: "About & contact", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer" id="learn">
      <Container>
        <section aria-labelledby="footer-cta-title" className="site-footer__banner">
          <MediaFrame
            asset={media.footer.workflow}
            className="site-footer__art"
            sizes="(max-width: 640px) 100vw, 1080px"
          />
          <div className="site-footer__banner-copy">
            <h2 id="footer-cta-title">
              Compress images locally, from a URL, or from a webpage.
            </h2>
            <p>
              Reduce file size, convert formats and prepare web-ready assets in your
              browser.
            </p>
            <ButtonLink href="/compress-image" size="small">
              Open the free image compressor
            </ButtonLink>
          </div>
        </section>
        <div className="site-footer__row">
          <div>
            <Link
              aria-label="CompressByURL home"
              className="site-wordmark site-wordmark--footer"
              href="/"
            >
              <BrandLogo />
            </Link>
            <p>Make images lighter. Keep local files private.</p>
          </div>
          <nav aria-label="Site information">
            {footerLinks.map((item) => (
              <Link href={item.href} key={item.label}>
                <span className="nav-link__label">{item.label}</span>
              </Link>
            ))}
            <CookieSettingsButton />
          </nav>
        </div>
      </Container>
    </footer>
  );
}
