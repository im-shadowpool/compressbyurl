const LOCAL_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? LOCAL_SITE_URL;
  const url = new URL(configured);
  url.hash = "";
  url.pathname = "/";
  url.search = "";
  return url;
}

export function absoluteSiteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}
