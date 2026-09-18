import Link from "next/link";

import { LegalPage, type LegalSection } from "@/components/legal";
import {
  LEGAL_EFFECTIVE_DATE,
  SUPPORT_CONTACT_EMAIL,
  getLegalRoute,
} from "@/config/legal";
import { createLegalMetadata } from "@/config/legal-metadata";

const route = getLegalRoute("/about");

export const metadata = createLegalMetadata("/about");

const sections: readonly LegalSection[] = [
  {
    id: "why",
    title: "Why CompressByURL exists",
    body: (
      <>
        <p>
          Image optimization is usually presented as a single upload box. That works for
          files already on your device, but not for an image you found by URL or a webpage
          whose heavy assets you need to audit. CompressByURL brings those three starting
          points into one focused tool.
        </p>
        <p>
          The goal is practical: make images lighter, keep the common workflow private,
          and turn webpage findings into replacement files you can actually use.
        </p>
      </>
    ),
  },
  {
    id: "workflows",
    title: "Three workflows, one local engine",
    body: (
      <ul>
        <li>
          <strong>Upload Files:</strong> process JPEG, PNG, WebP and static AVIF files in
          your browser without uploading their bytes for compression.
        </li>
        <li>
          <strong>Image URL:</strong> retrieve one public image, then use the same local
          resize, format, quality, naming and download controls.
        </li>
        <li>
          <strong>Website URL:</strong> inspect discoverable images on one public page,
          choose candidates and create a local replacement bundle.
        </li>
      </ul>
    ),
  },
  {
    id: "principles",
    title: "How the product is built",
    body: (
      <>
        <p>
          Browser workers keep heavy compression work away from the interface. Codec code
          is loaded only when needed, object URLs are cleaned up, batch concurrency is
          bounded, and settings stay in browser storage. URL services are intentionally
          narrow: public HTTP/HTTPS destinations only, with redirect, network, content,
          time and byte checks.
        </p>
        <p>
          The product supports static images, not animated GIF, WebP or AVIF. It does not
          include accounts, cloud storage or a general-purpose web crawler.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <>
        <p>
          For product feedback, support, accessibility issues or responsible security
          reports, email{" "}
          <a href={`mailto:${SUPPORT_CONTACT_EMAIL}`}>{SUPPORT_CONTACT_EMAIL}</a>. Include
          the page you were using, your browser and a concise description. Do not attach
          private images or secret URLs unless we specifically ask for them.
        </p>
        <p>
          Privacy requests are explained in the{" "}
          <Link href="/privacy">Privacy Policy</Link>. Usage rules are in the{" "}
          <Link href="/terms">Terms of Use</Link>.
        </p>
      </>
    ),
  },
] as const;

export default function AboutPage() {
  return (
    <LegalPage
      dateLabel="Reviewed"
      description={route.description}
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      sections={sections}
      summary={[
        "Browser-first compression for files already on your device.",
        "Public image and webpage URL workflows with restricted network access.",
        "Static JPEG, PNG, WebP and AVIF support with local downloads.",
        "No accounts, cloud library or full-site crawler.",
      ]}
      title={route.title}
    />
  );
}
