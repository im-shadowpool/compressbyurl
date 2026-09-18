import Link from "next/link";

import { Container } from "@/components/layout";
import { MediaFrame } from "@/components/media";
import { media } from "@/lib/media";

import { BrandLogo } from "./brand-logo";

const footerLinks = [
  { label: "Compress", href: "/compress-image" },
  { label: "Privacy", href: "/#privacy" },
  { label: "URL tools", href: "/website-image-scanner" },
  { label: "Learn", href: "/learn" },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer" id="learn">
      <Container>
        <div className="site-footer__banner">
          <MediaFrame
            asset={media.footer.workflow}
            className="site-footer__art"
            sizes="(max-width: 640px) 100vw, 1080px"
          />
          <div className="site-footer__banner-copy">
            <p>Ready when your images are.</p>
            <Link href="/compress-image">Start compressing</Link>
          </div>
        </div>
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
          <nav aria-label="Footer navigation">
            {footerLinks.map((item) => (
              <Link href={item.href} key={item.label}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
