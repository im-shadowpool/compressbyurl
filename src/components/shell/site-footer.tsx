import Link from "next/link";

import { Container } from "@/components/layout";

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
        <div className="site-footer__row">
          <div>
            <Link className="site-wordmark" href="/">
              CompressByURL
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
