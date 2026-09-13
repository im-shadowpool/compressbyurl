import Link from "next/link";

import { Container } from "@/components/layout";

const footerLinks = [
  { label: "Compress", href: "#tool" },
  { label: "Privacy", href: "#privacy" },
  { label: "Tools", href: "#tool" },
  { label: "Learn", href: "#learn" },
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
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
