/**
 * Site-wide constants. `SITE_URL` is read when the static export is built, so
 * canonical URLs, the sitemap, llms.txt and JSON-LD all carry the origin the
 * build was made for. Production builds set SITE_URL=https://docs.squareshare.eu.
 */
export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3100").replace(/\/+$/, "");

/** The one address search engines may index. */
export const PRODUCTION_URL = "https://docs.squareshare.eu";

/**
 * Only a build for the production address is indexable. Every other build
 * (localhost, the GitHub Pages dev site, the workers.dev preview) puts noindex
 * on every page, published or not, so a copy can never compete with the real
 * site. NOINDEX=1 forces noindex on a production build too.
 */
export const INDEXABLE = SITE_URL === PRODUCTION_URL && process.env.NOINDEX !== "1";

export const BRAND_NAME = "SquareShare";
export const BRAND_ALTERNATE_NAME = "Square Share";
export const CONTACT_EMAIL = "office@squareshare.eu";
export const HOME_URL = "https://squareshare.eu";
export const DASHBOARD_URL = "https://dashboard.squareshare.eu";

/**
 * Where "Get started" goes. squareshare.eu has no waitlist URL: the waitlist
 * is a modal opened by the homepage's own "Get started" buttons, which sit at
 * the top of the page. So this is the homepage's canonical address, without a
 * #fragment, so links from the docs count toward the page search engines rank.
 * TODO(adrian): swap for a real waitlist URL once squareshare.eu has one.
 */
export const WAITLIST_URL = `${HOME_URL}/`;

/**
 * Google Analytics 4 measurement ID ("G-" and letters/digits), read when the
 * site is built. Unset (today), the docs load no analytics, show no consent
 * banner and set no cookies. Set, they show squareshare.eu's consent banner
 * (one choice, stored on .squareshare.eu, covers both sites) and load GA4 only
 * for visitors who accept Analytics. Use the same ID as squareshare.eu.
 *
 * BEFORE SETTING IT: squareshare.eu's Cookie and Privacy Policies must name
 * Google Analytics, and both sites' consent policyVersion must be bumped
 * together (CONSENT_POLICY_VERSION below and Home's ConsentRoot.tsx).
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
export const GA_MEASUREMENT_ID = /^G-[A-Z0-9]+$/.test(GA_ID) ? GA_ID : null;

/** Must equal the version at the top of squareshare.eu's Cookie Policy, as in Home's ConsentRoot.tsx. */
export const CONSENT_POLICY_VERSION = "1.0";
export const COOKIE_POLICY_URL = `${HOME_URL}/legal/cookie-policy/`;

/**
 * Where consent records go: squareshare.eu keeps them all (it allows this
 * site's origin). NEXT_PUBLIC_CONSENT_LOG_URL points a local build at a local
 * Home, so testing never writes to the production table.
 */
export const CONSENT_LOG_URL = process.env.NEXT_PUBLIC_CONSENT_LOG_URL ?? `${HOME_URL}/api/consent-log/`;

/** Path of the logo used in JSON-LD and Open Graph. Served from public/. */
export const LOGO_PATH = "/logo.png";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
