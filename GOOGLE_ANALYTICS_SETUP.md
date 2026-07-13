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
- The Google `gtag.js` script is found by a stable element ID or matching Measurement ID URL and injected only when absent.
- Initialization uses one shared promise. It creates `dataLayer`, defines `gtag`, queues the `js` command, waits for `gtag.js` to load, and only then sends the `config` command.
- The `gtag` shim uses Google's supported `dataLayer.push(arguments)` command format. A previous rest-parameter array queue could display commands locally without the loaded tag processing them into `g/collect` requests.
- GA automatic page views are disabled with `send_page_view: false`.
- `AnalyticsRouteTracker` awaits initialization and sends one explicit, deduplicated `page_view` when the React Router pathname or query string changes.
- Script load failures are non-fatal and clear the initialization promise so a later request can retry safely.
- Order numbers are removed from analytics paths. Account order-detail paths are also normalized to avoid collecting customer/order identifiers.
- No Google Tag Manager is used.

Active storefront events use INR and the shared product-to-GA4 item mapper:

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

Active events are `page_view`, `search` (700 ms settled Shop query), `view_item`, `add_to_wishlist`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, `coupon_apply`, `coupon_remove`, and `purchase`.

Product views and checkout transitions use in-memory signatures to avoid Strict Mode/rerender duplicates. Purchases use a local-storage key based on the public order number, preventing duplicate purchase events after refresh or route revisit. No payload contains customer names, email, phone, address, PIN code, payment details, notes, warehouse, or courier data.

## Local ecommerce journey

1. Visit Home, then Shop.
2. Type a Shop search and pause for at least 700 ms.
3. Open a product, add it to the wishlist, then add it to cart.
4. Open the full Cart page and continue to Checkout.
5. Enter a serviceable delivery PIN, apply a coupon if available, and select a payment method.
6. Complete a COD test order. Razorpay purchase tracking occurs only after verified order finalization.
7. Inspect the console, GA4 DebugView, or run `window.getHouseOfPataniAnalyticsLog()`.

The expected journey is: `page_view`, `search`, `view_item`, `add_to_wishlist`, `add_to_cart`, `view_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, optional `coupon_apply`, and `purchase`.

## Verification

For a quick local check, open the local site and run this in the browser console:

```js
window.testHouseOfPataniAnalytics()
```

Then check GA4 DebugView for `test_event`. The helper and `debug_mode` are development-only and are not exposed in production builds.

The helper also requests the GA client ID through `gtag('get', ...)` and watches Resource Timing for a real `google-analytics.com/g/collect` request. The in-memory analytics log confirms event generation only; it does not prove Google received an event. If collection is not observed, test with tracking protection and ad-blocking extensions disabled and check for `ERR_BLOCKED_BY_CLIENT`.

No Content Security Policy or consent-mode implementation currently exists in this project. The Netlify security headers therefore do not block GA collection, and analytics is not held in a denied consent state.

1. Add the environment variable to a non-production deploy and rebuild.
2. Open the browser Network panel and confirm one request loads `googletagmanager.com/gtag/js?id=G-...`.
3. Navigate between Home, Shop, About, and two product routes without refreshing.
4. In GA4 DebugView or Realtime, confirm one `page_view` per navigation.
5. Confirm order-confirmation URLs appear as `/order-confirmation`, without an order number.
6. Remove the environment variable and rebuild; confirm the GA script is not requested.

Do not place customer names, email addresses, phone numbers, addresses, order numbers, or payment references in analytics parameters.
