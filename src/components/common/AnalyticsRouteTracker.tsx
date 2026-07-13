import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  initializeAnalytics,
  isAnalyticsConfigured,
  trackPageView,
} from "@/lib/analytics";

let lastGaPageView = "";

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
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const path = `${safePath}${search}`;
      void initializeAnalytics().then((ready) => {
        if (cancelled || !ready || lastGaPageView === path) return;
        lastGaPageView = path;
        trackPageView(path, document.title);
      });
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname, search]);

  return null;
}
