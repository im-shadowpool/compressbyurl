"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MaterialSymbol } from "@/components/icons";
import { Container } from "@/components/layout";
import { IconButton } from "@/components/ui";

import { BrandLogo } from "./brand-logo";

const navigation = [
  { label: "Compress", href: "/compress-image" },
  { label: "Convert", href: "/image-converter" },
  { label: "Resize", href: "/resize-image" },
  { label: "Target size", href: "/compress-image-to-200kb" },
  { label: "By URL", href: "/compress-image-from-url" },
  { label: "Website scanner", href: "/website-image-scanner" },
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
            <BrandLogo priority />
          </Link>
          <nav className="site-nav site-nav--desktop" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link href={item.href} key={item.label}>
                {item.label}
              </Link>
            ))}
          </nav>
          <Link className="site-header__action" href="/compress-image">
            Start compressing
          </Link>
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
