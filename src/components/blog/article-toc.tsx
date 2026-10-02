"use client";
import { useEffect, useState } from "react";

export function ArticleToc({
  sections,
}: {
  sections: readonly { id: string; title: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  useEffect(() => {
    const elements = sections.flatMap((section) => {
      const element = document.getElementById(section.id);
      return element ? [element] : [];
    });
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -55% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);
  return (
    <nav aria-label="Table of contents" className="blog-toc">
      <h2>On this page</h2>
      <ol>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? "location" : undefined}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
