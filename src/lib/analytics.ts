type AnalyticsParameter = boolean | number | string | undefined;

export type AnalyticsParameters = Record<string, AnalyticsParameter>;

type AnalyticsCommand = (...args: unknown[]) => void;

interface MetaPixelCommand extends AnalyticsCommand {
  callMethod?: AnalyticsCommand;
  loaded?: boolean;
  queue?: unknown[][];
  version?: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[][];
    fbq?: MetaPixelCommand;
    gtag?: AnalyticsCommand;
  }
}

const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const metaPixelId = import.meta.env.VITE_META_PIXEL_ID?.trim();
const validGaId = gaMeasurementId && /^G-[A-Z0-9]+$/i.test(gaMeasurementId);
const validMetaId = metaPixelId && /^\d{5,20}$/.test(metaPixelId);
let initialized = false;

function appendScript(id: string, source: string) {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.id = id;
  script.src = source;
  document.head.append(script);
}

function initializeGoogleAnalytics(measurementId: string) {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false,
  });
  appendScript(
    "house-of-patani-google-analytics",
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
  );
}

function initializeMetaPixel(pixelId: string) {
  const queue: unknown[][] = [];
  const command = ((...args: unknown[]) => {
    if (command.callMethod) {
      command.callMethod(...args);
      return;
    }

    queue.push(args);
  }) as MetaPixelCommand;

  command.loaded = true;
  command.queue = queue;
  command.version = "2.0";
  window.fbq = command;
  window.fbq("init", pixelId);
  appendScript(
    "house-of-patani-meta-pixel",
    "https://connect.facebook.net/en_US/fbevents.js",
  );
}

export function initializeAnalytics() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;

  if (validGaId && gaMeasurementId) {
    initializeGoogleAnalytics(gaMeasurementId);
  }

  if (validMetaId && metaPixelId) {
    initializeMetaPixel(metaPixelId);
  }
}

export function isAnalyticsConfigured() {
  return Boolean(validGaId || validMetaId);
}

export function trackPageView(path: string, title: string) {
  if (validGaId && gaMeasurementId) {
    window.gtag?.("event", "page_view", {
      page_location: `${window.location.origin}${path}`,
      page_path: path,
      page_title: title,
      send_to: gaMeasurementId,
    });
  }

  if (validMetaId) {
    window.fbq?.("track", "PageView");
  }
}

export function trackEvent(
  name: string,
  parameters: AnalyticsParameters = {},
) {
  if (validGaId) {
    window.gtag?.("event", name, parameters);
  }

  if (validMetaId) {
    window.fbq?.("trackCustom", name, parameters);
  }
}
