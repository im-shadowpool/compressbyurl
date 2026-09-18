export const LEGAL_EFFECTIVE_DATE = "September 19, 2026";
export const LEGAL_CONTACT_EMAIL = "privacy@compressbyurl.com";
export const SUPPORT_CONTACT_EMAIL = "hello@compressbyurl.com";

export const LEGAL_ROUTES = [
  {
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "How CompressByURL handles local images, submitted URLs, technical logs, browser settings and optional analytics.",
  },
  {
    path: "/terms",
    title: "Terms of Use",
    description:
      "The rules for using CompressByURL, including responsible URL scanning, ownership, availability and liability.",
  },
  {
    path: "/cookies",
    title: "Cookie Policy",
    description:
      "How CompressByURL uses local browser storage and optional Google Analytics cookies, and how to change your choice.",
  },
  {
    path: "/about",
    title: "About & Contact",
    description:
      "Why CompressByURL is browser-first, how its three image workflows differ and how to contact the project.",
  },
] as const;

export type LegalRoutePath = (typeof LEGAL_ROUTES)[number]["path"];

export function getLegalRoute(path: LegalRoutePath) {
  const route = LEGAL_ROUTES.find((candidate) => candidate.path === path);
  if (!route) throw new Error(`Unknown legal route: ${path}`);
  return route;
}
