export const ANALYTICS_CONSENT_KEY = "compressbyurl.analytics-consent.v1";
export const ANALYTICS_CONSENT_CHANGED_EVENT = "compressbyurl:analytics-consent-changed";
export const OPEN_COOKIE_SETTINGS_EVENT = "compressbyurl:open-cookie-settings";

export type AnalyticsConsentValue = "accepted" | "declined";

export function isAnalyticsConsentValue(
  value: string | null,
): value is AnalyticsConsentValue {
  return value === "accepted" || value === "declined";
}
