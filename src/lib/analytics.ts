type AnalyticsParameter = boolean | number | string | undefined;

export type AnalyticsParameters = Record<string, AnalyticsParameter>;

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  affiliation?: string;
  coupon?: string;
  currency?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
}

interface CommerceParameters {
  currency?: string;
  value?: number;
}

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
    testHouseOfPataniAnalytics?: () => AnalyticsDiagnosticsResult;
  }
}

export interface AnalyticsDiagnosticsResult {
  dataLayerAvailable: boolean;
  gtagAvailable: boolean;
  initialized: boolean;
  measurementIdPresent: boolean;
  testEventSent: boolean;
}

const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const metaPixelId = import.meta.env.VITE_META_PIXEL_ID?.trim();
const validGaId = gaMeasurementId && /^G-[A-Z0-9]+$/i.test(gaMeasurementId);
const validMetaId = metaPixelId && /^\d{5,20}$/.test(metaPixelId);
let initialized = false;
let gaInitialized = false;

function gaParameters(parameters: Record<string, unknown> = {}) {
  return import.meta.env.DEV ? { ...parameters, debug_mode: true } : parameters;
}

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
  gaInitialized = true;
  appendScript(
    "house-of-patani-google-analytics",
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
  );

  if (import.meta.env.DEV) {
    console.info("[GA4] Initialized");
    console.info(`[GA4] Measurement ID: ${measurementId}`);
  }
}

function installDevelopmentDiagnostics() {
  if (!import.meta.env.DEV) return;

  window.testHouseOfPataniAnalytics = () => {
    const result: AnalyticsDiagnosticsResult = {
      dataLayerAvailable: Array.isArray(window.dataLayer),
      gtagAvailable: typeof window.gtag === "function",
      initialized: gaInitialized,
      measurementIdPresent: Boolean(validGaId && gaMeasurementId),
      testEventSent: false,
    };

    if (!result.initialized || !result.gtagAvailable) {
      console.error("[GA4] test_event failed: Analytics is not initialized.", result);
      return result;
    }

    window.gtag?.("event", "test_event", gaParameters());
    result.testEventSent = true;
    console.info("[GA4] event sent: test_event");
    console.info("[GA4] Diagnostics passed", result);
    return result;
  };
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

  installDevelopmentDiagnostics();
}

export function isAnalyticsConfigured() {
  return Boolean(validGaId || validMetaId);
}

export function trackPageView(path: string, title: string) {
  if (validGaId && gaMeasurementId) {
    window.gtag?.("event", "page_view", gaParameters({
      page_location: `${window.location.origin}${path}`,
      page_path: path,
      page_title: title,
      send_to: gaMeasurementId,
    }));
    if (import.meta.env.DEV) console.info(`[GA4] page_view sent: ${path}`);
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
    window.gtag?.("event", name, gaParameters(parameters));
    if (import.meta.env.DEV) console.info(`[GA4] event sent: ${name}`);
  }

  if (validMetaId) {
    window.fbq?.("trackCustom", name, parameters);
  }
}

function trackCommerceEvent(
  name: string,
  parameters: Record<string, unknown>,
) {
  if (!validGaId) return;
  window.gtag?.("event", name, gaParameters(parameters));
  if (import.meta.env.DEV) console.info(`[GA4] event sent: ${name}`);
}

export function trackViewItem(item: AnalyticsItem, parameters: CommerceParameters = {}) {
  trackCommerceEvent("view_item", { ...parameters, items: [item] });
}

export function trackAddToCart(item: AnalyticsItem, parameters: CommerceParameters = {}) {
  trackCommerceEvent("add_to_cart", { ...parameters, items: [item] });
}

export function trackRemoveFromCart(item: AnalyticsItem, parameters: CommerceParameters = {}) {
  trackCommerceEvent("remove_from_cart", { ...parameters, items: [item] });
}

export function trackViewCart(items: AnalyticsItem[], parameters: CommerceParameters = {}) {
  trackCommerceEvent("view_cart", { ...parameters, items });
}

export function trackBeginCheckout(items: AnalyticsItem[], parameters: CommerceParameters = {}) {
  trackCommerceEvent("begin_checkout", { ...parameters, items });
}

export function trackAddPaymentInfo(items: AnalyticsItem[], paymentType: string, parameters: CommerceParameters = {}) {
  trackCommerceEvent("add_payment_info", { ...parameters, items, payment_type: paymentType });
}

export function trackPurchase(items: AnalyticsItem[], transactionId: string, parameters: CommerceParameters = {}) {
  trackCommerceEvent("purchase", { ...parameters, items, transaction_id: transactionId });
}

export function trackSearch(searchTerm: string) {
  trackCommerceEvent("search", { search_term: searchTerm });
}

export function trackWishlist(item: AnalyticsItem, parameters: CommerceParameters = {}) {
  trackCommerceEvent("add_to_wishlist", { ...parameters, items: [item] });
}

export function trackApplyCoupon(coupon: string, parameters: CommerceParameters = {}) {
  trackCommerceEvent("select_promotion", { ...parameters, coupon });
}
