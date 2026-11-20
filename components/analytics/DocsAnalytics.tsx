"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Script from "next/script";
import { getGlobalPrivacyControl, hasAnalyticsConsent, onConsentChange } from "@squaresharedev/consent";
import { ConsentProvider } from "@squaresharedev/consent/react";
import { getGtag, handleTrackedClick } from "@/lib/analytics";
import { CONSENT_LOG_URL, CONSENT_POLICY_VERSION, COOKIE_POLICY_URL, GA_MEASUREMENT_ID } from "@/lib/site";

/*
 * squareshare.eu's consent banner and Google Analytics 4, for the docs. The
 * root layout renders this only when GA_MEASUREMENT_ID is set at build time
 * (lib/site.ts); without it the docs show no banner and set no cookies.
 *
 * Same rules as Home's ConsentRoot.tsx and Analytics.tsx: one consent cookie
 * on .squareshare.eu covers both sites, every choice is logged server-side
 * at squareshare.eu, nothing from Google loads before Analytics is accepted,
 * and withdrawing stops tracking on the spot.
 */

const CONTROLLER_NAME = "SquareShare";

function subscribe(onChange: () => void) {
  return onConsentChange(() => onChange());
}

function getServerSnapshot() {
  return false;
}

let configured = false;

function stopTracking(id: string) {
  (window as unknown as Record<string, boolean>)[`ga-disable-${id}`] = true;
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    document.cookie = `${name}=; Max-Age=0; path=/`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname.split(".").slice(-2).join(".")}`;
  }
}

/** Proof of consent: the cookie alone is not proof (Home's ConsentRoot.tsx does the same). */
function useConsentLog() {
  useEffect(
    () =>
      onConsentChange((record) => {
        void fetch(CONSENT_LOG_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...record, gpc: getGlobalPrivacyControl(), source: "docs" }),
          keepalive: true,
        }).catch(() => {});
      }),
    [],
  );
}

function Analytics({ id }: { id: string }) {
  useConsentLog();
  const granted = useSyncExternalStore(subscribe, hasAnalyticsConsent, getServerSnapshot);
  const wasGranted = useRef(false);

  useEffect(() => {
    const gtag = getGtag();
    if (granted) {
      (window as unknown as Record<string, boolean>)[`ga-disable-${id}`] = false;
      gtag?.("consent", "update", { analytics_storage: "granted" });
      if (!configured) {
        gtag?.("js", new Date());
        gtag?.("config", id, { allow_google_signals: false, allow_ad_personalization_signals: false });
        configured = true;
      }
      wasGranted.current = true;
    } else {
      if (wasGranted.current) gtag?.("consent", "update", { analytics_storage: "denied" });
      wasGranted.current = false;
      stopTracking(id);
    }
  }, [granted, id]);

  useEffect(() => {
    document.addEventListener("click", handleTrackedClick, { capture: true });
    return () => document.removeEventListener("click", handleTrackedClick, { capture: true });
  }, []);

  if (!granted) return null;
  // The ID is checked against /^G-[A-Z0-9]+$/ in lib/site.ts.
  return <Script id="ga-gtag" src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />;
}

export function DocsAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <>
      <ConsentProvider
        policyVersion={CONSENT_POLICY_VERSION}
        cookiePolicyHref={COOKIE_POLICY_URL}
        controllerName={CONTROLLER_NAME}
        // Home's wording (no em dashes), so the banner reads the same on both sites.
        labels={{
          description: `${CONTROLLER_NAME} uses cookies and similar technologies for sign-in, security and payments. We use them for analytics and personalization only with your consent. You can change your choice at any time.`,
        }}
      />
      <Analytics id={GA_MEASUREMENT_ID} />
    </>
  );
}
