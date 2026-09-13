"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MaterialSymbol } from "@/components/icons";
import { Container } from "@/components/layout";
import { IconButton } from "@/components/ui";

const navigation = [
  { label: "Compress", href: "#tool" },
  { label: "Convert", href: "#tool" },
  { label: "Resize", href: "#tool" },
  { label: "Target size", href: "#tool" },
  { label: "By URL", href: "#tool" },
  { label: "Website scanner", href: "#tool" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="site-header">
      <Container>
        <div className="site-header__row">
          <Link className="site-wordmark" href="/" aria-label="CompressByURL home">
            CompressByURL
          </Link>
          <nav className="site-nav site-nav--desktop" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link href={item.href} key={item.label}>
                {item.label}
              </Link>
            ))}
          </nav>
          <a className="site-header__action" href="#tool">
            Start compressing
          </a>
          <div className="site-header__menu-button">
            <IconButton
              aria-controls="mobile-navigation"
              aria-expanded={open}
              icon={<MaterialSymbol name={open ? "close" : "menu"} />}
              label={open ? "Close navigation" : "Open navigation"}
              onClick={() => setOpen((current) => !current)}
            />
          </div>
        </div>
        {open ? (
          <nav
            className="site-nav site-nav--mobile"
            id="mobile-navigation"
            aria-label="Mobile navigation"
          >
            <p className="site-nav__mobile-label">Explore CompressByURL</p>
            {navigation.map((item) => (
              <Link href={item.href} key={item.label} onClick={() => setOpen(false)}>
                {item.label}
                <MaterialSymbol name="arrow_forward" size={20} />
              </Link>
            ))}
          </nav>
        ) : null}
      </Container>
    </header>
  );
}
