import Link from "next/link";

import { LegalPage, type LegalSection } from "@/components/legal";
import { LEGAL_CONTACT_EMAIL, LEGAL_EFFECTIVE_DATE, getLegalRoute } from "@/config/legal";
import { createLegalMetadata } from "@/config/legal-metadata";

const route = getLegalRoute("/terms");

export const metadata = createLegalMetadata("/terms");

const sections: readonly LegalSection[] = [
  {
    id: "agreement",
    title: "Your agreement with us",
    body: (
      <>
        <p>
          These Terms govern your access to CompressByURL. By using the service, you agree
          to them. If you do not agree, do not use the service. You must be legally able
          to enter this agreement; if you use the service for an organisation, you confirm
          that you can bind that organisation.
        </p>
        <p>
          CompressByURL currently provides browser-based image compression, conversion,
          resizing, target-size processing, direct public-image import and single-page
          website image discovery. Features may change as the product develops.
        </p>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Your images and output",
    body: (
      <>
        <p>
          You keep your rights in images and other material you use with the service. You
          are responsible for having permission to process, copy, convert and download
          that material. CompressByURL does not claim ownership of your source images or
          generated output.
        </p>
        <p>
          Local files are processed on your device. For a URL request, you give us a
          limited instruction to retrieve and return the public resource solely to provide
          the feature, secure it and troubleshoot it. That instruction ends when the
          operational need ends.
        </p>
      </>
    ),
  },
  {
    id: "responsible-use",
    title: "Responsible use of URL tools",
    body: (
      <>
        <p>You must not use CompressByURL to:</p>
        <ul>
          <li>
            access private systems, local networks, cloud metadata or restricted data;
          </li>
          <li>
            bypass authentication, paywalls, access controls or technical restrictions;
          </li>
          <li>scan or fetch resources you are not authorised to access;</li>
          <li>infringe copyright, privacy, publicity or other rights;</li>
          <li>distribute malware or illegal, abusive or harmful material;</li>
          <li>
            overload, automate against or interfere with the service or another website;
          </li>
          <li>evade request limits or use the service as a general-purpose proxy.</li>
        </ul>
        <p>
          URL modes are intended for individual public resources and one public webpage at
          a time. They are not a full-site crawler. We may block destinations, requests or
          users when reasonably necessary for security, legal compliance or service
          reliability.
        </p>
      </>
    ),
  },
  {
    id: "service-limits",
    title: "Service limits and availability",
    body: (
      <>
        <p>
          Remote websites control whether their resources can be fetched. A scan may miss
          lazy-loaded, script-generated, authenticated or technically restricted images.
          Format support is limited to static JPEG, PNG, WebP and AVIF. Animated formats
          are not supported.
        </p>
        <p>
          Compression results vary by image, browser, codec and settings. A smaller file,
          a particular quality level or an exact target size is not guaranteed. Review
          output before replacing production assets and keep backups of originals.
        </p>
        <p>
          We may change, rate-limit, suspend or discontinue features. We do not promise
          uninterrupted availability or permanent storage; the service is not designed as
          a storage or backup system.
        </p>
      </>
    ),
  },
  {
    id: "our-property",
    title: "Our software and brand",
    body: (
      <p>
        The CompressByURL name, visual identity, site copy and service software are owned
        by their respective operator or licensors and are protected by applicable law.
        These Terms give you a limited, revocable, non-exclusive right to use the service
        for its intended purpose. They do not transfer our intellectual-property rights.
      </p>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    body: (
      <>
        <p>
          To the extent permitted by law, the service is provided “as is” and “as
          available.” We disclaim implied warranties of merchantability, fitness for a
          particular purpose, non-infringement and uninterrupted or error-free operation.
          Nothing in these Terms excludes a warranty or consumer right that cannot legally
          be excluded.
        </p>
        <p>
          Information on the site is general product guidance, not legal, security or
          professional advice. You are responsible for deciding whether your use of an
          image or remote resource is lawful and suitable.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limits on liability",
    body: (
      <>
        <p>
          To the extent permitted by law, CompressByURL and its operator will not be
          liable for indirect, incidental, special, consequential or punitive damages, or
          for lost data, profits, goodwill or business opportunities arising from the
          service.
        </p>
        <p>
          Where liability cannot be excluded, total liability relating to the free service
          is limited to the greater of the amount you paid to use it in the preceding 12
          months or USD 100. These limits do not apply where prohibited by law or to
          liability that cannot legally be limited.
        </p>
      </>
    ),
  },
  {
    id: "general",
    title: "Changes, disputes and contact",
    body: (
      <>
        <p>
          We may update these Terms. The effective date will change when revised Terms are
          published. Continued use after an update means you accept the revised Terms to
          the extent permitted by law.
        </p>
        <p>
          Before starting a formal dispute, please email{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a> so we can
          try to resolve it. Applicable mandatory consumer protections and conflict-of-law
          rules remain in effect. If one part of these Terms is unenforceable, the rest
          remains effective. Failure to enforce a term once is not a waiver.
        </p>
        <p>
          See the <Link href="/privacy">Privacy Policy</Link> for information handling and
          the <Link href="/cookies">Cookie Policy</Link> for browser storage.
        </p>
      </>
    ),
  },
] as const;

export default function TermsPage() {
  return (
    <LegalPage
      description={route.description}
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      sections={sections}
      summary={[
        "Use only images and public URLs you are authorised to process.",
        "The URL features are not a crawler, proxy or access-control bypass.",
        "Check every output before using it in production and keep your originals.",
        "The free service is provided without an uptime or target-size guarantee.",
      ]}
      title={route.title}
    />
  );
}
