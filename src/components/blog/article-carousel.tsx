"use client";
import { useEffect, useRef, useState } from "react";
import { MaterialSymbol } from "@/components/icons";

export function ArticleCarousel({ children }: { children: React.ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ atStart: true, atEnd: false });
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () =>
      setPosition({
        atStart: element.scrollLeft <= 2,
        atEnd: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    update();
    element.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      resize.disconnect();
    };
  }, []);
  function move(direction: number) {
    const element = rail.current;
    if (!element) return;
    const card = element.firstElementChild;
    const distance = card ? card.getBoundingClientRect().width + 24 : element.clientWidth;
    element.scrollBy({
      left: distance * direction,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  return (
    <div
      className="blog-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Image optimization guides"
    >
      <div
        ref={rail}
        className="blog-carousel__rail"
        tabIndex={0}
        aria-label="Scroll through guides"
      >
        {children}
      </div>
      <div className="blog-carousel__controls">
        <span>Explore the guides</span>
        <div>
          <button
            type="button"
            aria-label="Previous guides"
            disabled={position.atStart}
            onClick={() => move(-1)}
          >
            <MaterialSymbol name="arrow_back" />
          </button>
          <button
            type="button"
            aria-label="Next guides"
            disabled={position.atEnd}
            onClick={() => move(1)}
          >
            <MaterialSymbol name="arrow_forward" />
          </button>
        </div>
      </div>
    </div>
  );
}
