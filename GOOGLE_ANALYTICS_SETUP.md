# Google Analytics 4 setup

## Configuration

Add the GA4 Measurement ID to the Netlify production environment:

```text
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Use the Measurement ID from the GA4 web data stream. Do not commit the real ID to source control. Because this is a Vite variable, Netlify must rebuild and redeploy the site after it is added or changed.

When the variable is absent or does not match the `G-...` format, Google Analytics is not initialized and no GA script or GA events are sent.

## How it works

- `src/lib/analytics.ts` owns script injection, initialization, page views, and future event helpers.
- The Google `gtag.js` script is injected once at runtime.
- GA automatic page views are disabled with `send_page_view: false`.
- `AnalyticsRouteTracker` sends one explicit `page_view` when the React Router pathname or query string changes.
- Order numbers are removed from analytics paths. Account order-detail paths are also normalized to avoid collecting customer/order identifiers.
- No Google Tag Manager is used.

Only page views are currently wired into the storefront. The exported ecommerce helpers are intentionally not called yet:

- `trackViewItem`
- `trackAddToCart`
- `trackRemoveFromCart`
- `trackViewCart`
- `trackBeginCheckout`
- `trackAddPaymentInfo`
- `trackPurchase`
- `trackSearch`
- `trackWishlist`
- `trackApplyCoupon`

## Verification

For a quick local check, open the local site and run this in the browser console:

```js
window.testHouseOfPataniAnalytics()
```

Then check GA4 DebugView for `test_event`. The helper and `debug_mode` are development-only and are not exposed in production builds.

1. Add the environment variable to a non-production deploy and rebuild.
2. Open the browser Network panel and confirm one request loads `googletagmanager.com/gtag/js?id=G-...`.
3. Navigate between Home, Shop, About, and two product routes without refreshing.
4. In GA4 DebugView or Realtime, confirm one `page_view` per navigation.
5. Confirm order-confirmation URLs appear as `/order-confirmation`, without an order number.
6. Remove the environment variable and rebuild; confirm the GA script is not requested.

Do not place customer names, email addresses, phone numbers, addresses, order numbers, or payment references in analytics parameters.
