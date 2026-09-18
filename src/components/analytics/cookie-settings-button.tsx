"use client";

import { OPEN_COOKIE_SETTINGS_EVENT } from "@/lib/analytics-consent";

export function CookieSettingsButton() {
  return (
    <button
      className="site-footer__text-button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
      type="button"
    >
      <span className="nav-link__label">Cookie settings</span>
    </button>
  );
}
