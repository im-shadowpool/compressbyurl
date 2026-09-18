import Link from "next/link";

import { LegalPage, type LegalSection } from "@/components/legal";
import { LEGAL_CONTACT_EMAIL, LEGAL_EFFECTIVE_DATE, getLegalRoute } from "@/config/legal";
import { createLegalMetadata } from "@/config/legal-metadata";

const route = getLegalRoute("/privacy");

export const metadata = createLegalMetadata("/privacy");

const sections: readonly LegalSection[] = [
  {
    id: "scope",
    title: "Who this policy covers",
    body: (
      <>
        <p>
          This policy explains how CompressByURL handles information when you visit the
          website or use its image tools. CompressByURL is the controller for personal
          information described here. Questions and privacy requests can be sent to{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
        </p>
        <p>
          This policy does not control the privacy practices of websites you ask the URL
          tools to contact, your browser vendor, hosting providers acting independently,
          or websites linked from CompressByURL.
        </p>
      </>
    ),
  },
  {
    id: "local-images",
    title: "Images selected from your device",
    body: (
      <>
        <p>
          Upload mode processes image bytes in your browser. Decoding, resizing,
          compression, conversion, previews, target-size search, naming and ZIP creation
          happen on your device. We do not intentionally transmit local image bytes,
          filenames, previews or embedded metadata to our servers or analytics provider.
        </p>
        <p>
          Your browser may keep temporary in-memory data and object URLs while the tool is
          open. The app revokes those object URLs when they are no longer needed. If you
          choose to preserve JPEG metadata, the resulting download may retain metadata
          from your original file; metadata removal is the default.
        </p>
      </>
    ),
  },
  {
    id: "url-modes",
    title: "Image URL and Website URL modes",
    body: (
      <>
        <p>
          URL tools must use the network to retrieve the public resource you request. The
          submitted URL, request time, response details, security outcome and associated
          technical data may be processed by our server and hosting infrastructure to
          provide the request, prevent abuse and diagnose failures.
        </p>
        <p>
          Direct browser fetching is tried where available. When a remote server blocks
          browser access, our limited fetch service may retrieve the image. Website scans
          retrieve one public HTML page and identify candidate image URLs. We validate
          destinations and redirects, block private and reserved networks, restrict
          content types, and apply time, redirect, request and byte limits. Fetched images
          return to the browser for optimization.
        </p>
        <p>
          Do not submit private, signed, credential-bearing or confidential URLs. Query
          strings can contain personal or secret information even when a page is public.
        </p>
      </>
    ),
  },
  {
    id: "data-we-use",
    title: "Information we use and why",
    body: (
      <div className="legal-table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Information</th>
              <th scope="col">Purpose and legal basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">URL tool requests</th>
              <td>
                To perform the requested fetch, secure the service and enforce limits. We
                rely on providing the service you requested and our legitimate interests
                in operating it safely.
              </td>
            </tr>
            <tr>
              <th scope="row">Technical logs</th>
              <td>
                IP address, user agent, timestamps, request route, status and security
                events may be handled for reliability, fraud prevention and incident
                response under our legitimate interests.
              </td>
            </tr>
            <tr>
              <th scope="row">Saved tool settings</th>
              <td>
                Your browser stores compression preferences so the tool works as you
                requested. These settings stay on that browser unless you clear them.
              </td>
            </tr>
            <tr>
              <th scope="row">Optional analytics</th>
              <td>
                With your consent, Google Analytics measures visits, approximate region,
                device/browser information and on-site activity. We disable advertising
                signals and do not intentionally send image data, filenames or submitted
                URLs.
              </td>
            </tr>
            <tr>
              <th scope="row">Messages you send</th>
              <td>
                Your email address and message are used to answer your request. The basis
                is responding to you and our legitimate interest in support and security.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "sharing-retention",
    title: "Service providers, transfers and retention",
    body: (
      <>
        <p>
          Information may be handled by infrastructure and security providers that host or
          protect the service, by Google when you accept analytics, and by professional
          advisers or authorities when reasonably required by law or to protect rights and
          safety. We do not sell personal information or share it for cross-context
          behavioural advertising.
        </p>
        <p>
          Providers may process information in countries outside your own. Where required,
          we rely on the provider&apos;s contractual and legal transfer safeguards. Google
          describes its safeguards in its own privacy documentation.
        </p>
        <p>
          Local tool settings remain until you reset them, clear site storage or your
          browser removes them. Analytics retention follows the configured Google
          Analytics property and your consent choice. Operational and security records are
          kept only as long as reasonably needed for their purpose, legal obligations and
          dispute handling. Support messages are retained while the request is active and
          for a reasonable follow-up period.
        </p>
      </>
    ),
  },
  {
    id: "choices-rights",
    title: "Your choices and privacy rights",
    body: (
      <>
        <p>
          You can use local upload tools without accepting analytics. You can change your
          analytics choice from the “Cookie settings” control in the footer. You can reset
          saved compression settings from the tool or clear this site&apos;s browser
          storage.
        </p>
        <p>
          Depending on where you live, you may have rights to access, correct, delete,
          restrict, object to or receive a copy of personal information, and to withdraw
          consent. You also have the right to object to processing based on legitimate
          interests. Send a request to{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>. We may need
          to verify your request and may retain information where law permits or requires.
        </p>
        <p>
          You may complain to the data-protection authority where you live or work. We
          encourage you to contact us first so we can investigate. California residents
          can also review the rights described by the California Attorney General; because
          we do not sell or share personal information for targeted advertising, there is
          no separate sale/share opt-out flow.
        </p>
      </>
    ),
  },
  {
    id: "children-security-changes",
    title: "Children, security and changes",
    body: (
      <>
        <p>
          CompressByURL is a general-purpose image utility and is not directed to children
          under 13. We do not knowingly collect personal information from children through
          accounts because the service has no accounts.
        </p>
        <p>
          We use destination validation, content restrictions, request budgets and other
          safeguards appropriate to this service. No internet service can promise absolute
          security, so avoid submitting confidential URLs or information.
        </p>
        <p>
          We may update this policy when the service or legal requirements change. The
          effective date at the top will change when an update is published. Material
          changes will be made reasonably prominent on the site.
        </p>
        <p>
          For details about browser storage, read the{" "}
          <Link href="/cookies">Cookie Policy</Link>. Rules for using the tools are in the{" "}
          <Link href="/terms">Terms of Use</Link>.
        </p>
      </>
    ),
  },
] as const;

export default function PrivacyPage() {
  return (
    <LegalPage
      description={route.description}
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      sections={sections}
      summary={[
        "Local image files are processed in your browser, not uploaded for compression.",
        "URL modes contact public web resources and may use a restricted server-side fetch.",
        "Analytics is optional and should load only after you accept it.",
        "We do not sell personal information or use image contents for advertising.",
      ]}
      title={route.title}
    />
  );
}
