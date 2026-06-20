import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  initializeAnalytics,
  isAnalyticsConfigured,
  trackPageView,
} from "@/lib/analytics";

function privacySafePath(pathname: string) {
  if (pathname.startsWith("/order-confirmation/")) {
    return "/order-confirmation";
  }

  if (/^\/account\/orders\/[^/]+$/.test(pathname)) {
    return "/account/orders/detail";
  }

  return pathname;
}

export function AnalyticsRouteTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    initializeAnalytics();
  }, []);

  useEffect(() => {
    if (!isAnalyticsConfigured()) {
      return;
    }

    const safePath = privacySafePath(pathname);
    const timer = window.setTimeout(() => {
      trackPageView(`${safePath}${search}`, document.title);
    });

    return () => window.clearTimeout(timer);
  }, [pathname, search]);

  return null;
}
