import Link from "next/link";

import { LegalPage, type LegalSection } from "@/components/legal";
import { LEGAL_EFFECTIVE_DATE, getLegalRoute } from "@/config/legal";
import { createLegalMetadata } from "@/config/legal-metadata";

const route = getLegalRoute("/cookies");

export const metadata = createLegalMetadata("/cookies");

const sections: readonly LegalSection[] = [
  {
    id: "storage-we-use",
    title: "Browser storage we use",
    body: (
      <>
        <p>
          Cookies are small text records stored by a website in your browser. Similar
          technologies, including local storage, can remember information without sending
          a traditional cookie with every request.
        </p>
        <p>
          CompressByURL uses local storage for tool preferences and your analytics choice.
          If you accept analytics, Google Analytics may also set first-party cookies. We
          do not use advertising cookies, and declining analytics does not block the image
          tools.
        </p>
      </>
    ),
  },
  {
    id: "storage-list",
    title: "What is stored",
    body: (
      <div className="legal-table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Name or category</th>
              <th scope="col">Purpose</th>
              <th scope="col">Typical duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Tool preferences</th>
              <td>
                Remembers format, quality, resize, naming and privacy settings you choose.
                Stored locally; it does not contain your image files.
              </td>
              <td>Until reset or browser storage is cleared.</td>
            </tr>
            <tr>
              <th scope="row">Analytics choice</th>
              <td>
                Remembers whether you accepted or declined optional analytics so we can
                respect the choice on later visits.
              </td>
              <td>Until changed or browser storage is cleared.</td>
            </tr>
            <tr>
              <th scope="row">_ga</th>
              <td>Google Analytics identifier used to distinguish visitors.</td>
              <td>Up to 2 years after acceptance, subject to browser limits.</td>
            </tr>
            <tr>
              <th scope="row">_ga_&lt;measurement-id&gt;</th>
              <td>Google Analytics identifier used to maintain session state.</td>
              <td>Up to 2 years after acceptance, subject to browser limits.</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "analytics",
    title: "Optional analytics",
    body: (
      <>
        <p>
          If you accept, Google Analytics helps us understand visits, session activity,
          approximate region, and browser or device categories. Advertising signals and
          ad-personalisation signals are disabled in our tag configuration. We do not
          intentionally send image bytes, filenames, EXIF data, page HTML or full URLs you
          submit to the image tools.
        </p>
        <p>
          Google says its standard web implementation uses the <code>_ga</code> cookie to
          distinguish visitors and uses IP addresses at collection time for approximate
          location and service security. Google controls its own processing under its
          published terms and privacy information.
        </p>
      </>
    ),
  },
  {
    id: "change-choice",
    title: "Change or withdraw your choice",
    body: (
      <>
        <p>
          Use the “Cookie settings” control in the footer at any time. Declining removes
          the Google Analytics cookies we can access from this site and prevents the tag
          from loading on later page views. A choice made after analytics has already run
          cannot undo information previously sent, but it applies going forward.
        </p>
        <p>
          You can also remove this site&apos;s cookies and local storage in your browser
          settings. Blocking all local storage may prevent CompressByURL from remembering
          preferences, but the core local image workflow should remain usable.
        </p>
      </>
    ),
  },
  {
    id: "updates",
    title: "Updates and related information",
    body: (
      <p>
        We update this policy if storage names, purposes or providers change. Read the{" "}
        <Link href="/privacy">Privacy Policy</Link> for the broader explanation of
        information handling and your rights.
      </p>
    ),
  },
] as const;

export default function CookiesPage() {
  return (
    <LegalPage
      description={route.description}
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      sections={sections}
      summary={[
        "Image files are not stored in cookies or local storage.",
        "Tool preferences stay in your browser until you reset or clear them.",
        "Google Analytics is optional and loads only after acceptance.",
        "You can reopen Cookie settings from every page footer.",
      ]}
      title={route.title}
    />
  );
}
