import { hasAnalyticsConsent } from "@squaresharedev/consent";
import { DASHBOARD_URL, GA_MEASUREMENT_ID, WAITLIST_URL } from "./site.ts";

/**
 * Google Analytics 4 with Consent Mode v2, the same way squareshare.eu does it
 * (Home's src/lib/analytics.ts): every Google storage type is declared denied
 * before anything else runs (CONSENT_DEFAULT_SCRIPT, in the root layout's
 * <head>), and gtag.js is only fetched once the visitor accepts Analytics
 * (components/analytics/Analytics.tsx). Nothing reaches Google before that
 * choice, and events are sent only while consent is granted.
 */

/** Static text, nothing interpolated. Creates window.dataLayer and window.gtag; loads and stores nothing. */
export const CONSENT_DEFAULT_SCRIPT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'denied',personalization_storage:'denied',security_storage:'granted',wait_for_update:500});
gtag('set','ads_data_redaction',true);`;

type Gtag = (...args: unknown[]) => void;

export function getGtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  const gtag = (window as unknown as { gtag?: unknown }).gtag;
  return typeof gtag === "function" ? (gtag as Gtag) : null;
}

type EventParams = Record<string, string | number | boolean | undefined>;

/** Sends a GA4 event, but only when analytics is configured and consented to. */
export function trackEvent(name: string, params: EventParams = {}) {
  if (!GA_MEASUREMENT_ID || !hasAnalyticsConsent()) return;
  getGtag()?.("event", name, params);
}

const DASHBOARD_ORIGIN = new URL(DASHBOARD_URL).origin;

/**
 * One listener for the whole page:
 * - an element with data-track="<event>" sends that event with its
 *   data-placement; the sidebar menu's Get started link (rendered by
 *   Fumadocs, so it has no attribute) counts as get_started_click too;
 * - any link into the seller dashboard sends docs_to_dashboard_click and the
 *   cross-site outbound_click, with GA4's link_url, link_domain and link_text.
 * Links that leave in the same tab still report: gtag sends with sendBeacon.
 */
export function handleTrackedClick(event: MouseEvent) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const tracked = target.closest<HTMLElement>("[data-track]");
  const link = target.closest<HTMLAnchorElement>("a[href]");

  if (tracked?.dataset.track) {
    trackEvent(tracked.dataset.track, { placement: tracked.dataset.placement, link_url: link?.href });
  } else if (link && link.href === WAITLIST_URL) {
    trackEvent("get_started_click", { placement: "docs-menu", link_url: link.href });
  }

  if (!link) return;
  let url: URL;
  try {
    url = new URL(link.href);
  } catch {
    return;
  }
  if (url.origin !== DASHBOARD_ORIGIN) return;
  const params = {
    link_url: url.href,
    link_domain: url.hostname,
    link_text: link.textContent?.trim().slice(0, 100) || undefined,
    page_path: location.pathname,
    outbound: true,
  };
  trackEvent("docs_to_dashboard_click", params);
  trackEvent("outbound_click", params);
}
