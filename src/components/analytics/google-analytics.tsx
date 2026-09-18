"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui";
import {
  ANALYTICS_CONSENT_CHANGED_EVENT,
  ANALYTICS_CONSENT_KEY,
  OPEN_COOKIE_SETTINGS_EVENT,
  type AnalyticsConsentValue,
  isAnalyticsConsentValue,
} from "@/lib/analytics-consent";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const validMeasurementId = /^G-[A-Z0-9]+$/.test(measurementId ?? "")
  ? measurementId
  : null;

export function GoogleAnalytics() {
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const consent = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, onStoreChange);
      };
    },
    () => {
      try {
        const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
        return isAnalyticsConsentValue(value) ? value : null;
      } catch {
        return null;
      }
    },
    () => null,
  );
  const analyticsAvailable = Boolean(
    validMeasurementId && process.env.NODE_ENV === "production",
  );

  useEffect(() => {
    function openPreferences() {
      setPreferencesOpen(true);
    }

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openPreferences);
  }, []);

  function removeAnalyticsCookies() {
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.split("=")[0]?.trim();
      if (name === "_ga" || name?.startsWith("_ga_")) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      }
    }
  }

  function saveConsent(value: AnalyticsConsentValue) {
    try {
      window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    } catch {
      // The in-memory choice still applies for this page in restricted browsers.
    }

    if (value === "declined") {
      removeAnalyticsCookies();
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
    }

    window.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGED_EVENT));
    setPreferencesOpen(false);
  }

  const showPreferences = preferencesOpen || (analyticsAvailable && consent === null);

  return (
    <>
      {analyticsAvailable && consent === "accepted" ? (
        <>
          <Script
            id="google-analytics-library"
            src={`https://www.googletagmanager.com/gtag/js?id=${validMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', { analytics_storage: 'granted' });
              gtag('js', new Date());
              gtag('config', '${validMeasurementId}', {
                allow_google_signals: false,
                allow_ad_personalization_signals: false,
                send_page_view: true
              });
            `}
          </Script>
        </>
      ) : null}

      {showPreferences ? (
        <section
          aria-labelledby="cookie-consent-title"
          aria-live="polite"
          className="cookie-consent"
          role="dialog"
        >
          <div>
            <h2 id="cookie-consent-title">Choose analytics</h2>
            <p>
              Essential browser storage remembers your tool settings. Optional analytics
              helps us understand site use and loads only if you accept it. Image files,
              filenames and submitted URLs are not sent to analytics.
            </p>
            <Link href="/cookies">Read the Cookie Policy</Link>
          </div>
          <div className="cookie-consent__actions">
            <Button
              onClick={() => saveConsent("declined")}
              size="small"
              variant="inverse"
            >
              Decline analytics
            </Button>
            <Button
              disabled={!analyticsAvailable}
              onClick={() => saveConsent("accepted")}
              size="small"
            >
              {analyticsAvailable ? "Accept analytics" : "Analytics is off"}
            </Button>
          </div>
        </section>
      ) : null}
    </>
  );
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
