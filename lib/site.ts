/**
 * Site-wide constants. `SITE_URL` is read when the static export is built, so
 * canonical URLs, the sitemap, llms.txt and JSON-LD all carry the origin the
 * build was made for. Production builds set SITE_URL=https://docs.squareshare.eu.
 */
export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3100").replace(/\/+$/, "");

export const BRAND_NAME = "Square Share";
export const BRAND_ALTERNATE_NAME = "SquareShare";
export const CONTACT_EMAIL = "office@squareshare.eu";
export const HOME_URL = "https://squareshare.eu";
export const DASHBOARD_URL = "https://dashboard.squareshare.eu";

/**
 * squareshare.eu has no waitlist URL: the waitlist is a modal opened by the
 * site's "Get started" buttons. Home's own footer links to #hero, so we do too.
 * TODO(adrian): swap for a real waitlist URL once squareshare.eu has one.
 */
export const WAITLIST_URL = "https://squareshare.eu/#hero";

/** Path of the logo used in JSON-LD and Open Graph. Served from public/. */
export const LOGO_PATH = "/logo.png";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
