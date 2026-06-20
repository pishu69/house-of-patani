# Production Checklist

Record the deploy URL, commit, tester, and date before beginning.

- Deploy URL:
- Commit:
- Tester:
- Date:

## Build and Configuration

- [ ] `npm ci` completes successfully.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes without warnings.
- [ ] `npm run check:secrets` passes.
- [ ] Netlify uses Node.js 22.12 or later.
- [ ] All required Netlify production variables are set.
- [ ] All required Supabase Edge Function secrets are set.
- [ ] Test provider keys are not mixed with live provider keys.
- [ ] Browser console contains no unexpected errors.

## Supabase and Security

- [ ] All eight migrations are applied in timestamp order.
- [ ] `npx supabase migration list` shows local and remote histories aligned.
- [ ] Four storage buckets exist with 5 MB and JPEG/PNG/WebP restrictions.
- [ ] Public users can read active catalog data and public media only.
- [ ] Anonymous users cannot write products, orders, settings, or storage files.
- [ ] Active admins can perform authorized writes.
- [ ] A signed-in non-admin cannot access admin data or routes.
- [ ] Demo Admin Mode is absent from the production build.
- [ ] Demo Customer Mode and demo OTP are absent from the production build.
- [ ] Razorpay secret and payment verification remain server-side.
- [ ] Customer order access is limited to the matching customer or secure guest lookup.

## Storefront

- [ ] Homepage loads hero, categories, featured products, story, artisans, testimonials, newsletter, and footer.
- [ ] Shop search works by product name, tag, and category.
- [ ] Shop category, price, featured, best-seller, and new-arrival filters work.
- [ ] Shop sorting and pagination preserve URL parameters.
- [ ] Product page resolves a valid slug and shows gallery, details, reviews, and related products.
- [ ] Invalid product slug shows the polished not-found state.
- [ ] Add to cart works from product cards and product pages.
- [ ] Cart quantity limits respect stock.
- [ ] Cart persists after refresh.
- [ ] Empty cart and out-of-stock states are clear.

## Checkout and Payments

- [ ] Checkout rejects an empty cart.
- [ ] Checkout rejects out-of-stock items.
- [ ] Contact and Indian address validation work.
- [ ] COD creates an order with pending payment and order status.
- [ ] COD success page shows the correct order number and totals.
- [ ] Razorpay Test Mode checkout opens with the correct amount.
- [ ] Successful Razorpay test payment creates one paid, confirmed order.
- [ ] Razorpay payment ID and paid date appear in admin.
- [ ] Razorpay cancellation keeps the cart.
- [ ] Razorpay failure keeps the cart and does not create a paid order.
- [ ] Refreshing an order confirmation URL does not produce a Netlify 404.

## Customer OTP and Account

- [ ] Valid Indian mobile number can request an OTP.
- [ ] Resend cooldown is enforced.
- [ ] Invalid and expired OTPs show friendly errors.
- [ ] Repeated invalid attempts trigger throttling.
- [ ] Successful OTP login opens `/account`.
- [ ] Guest orders with the same phone are linked after login.
- [ ] Profile updates persist as expected.
- [ ] Add, edit, delete, and default address flows work.
- [ ] Local wishlist merges without duplicates after login.
- [ ] Logout clears the customer session.
- [ ] Account, orders, addresses, and wishlist empty states render correctly.
- [ ] Guest order lookup requires both order number and matching phone/email.
- [ ] Guest order lookup does not expose a mismatched order.

## Admin

- [ ] `/admin` redirects unauthenticated users to `/admin/login`.
- [ ] Valid active admin can log in.
- [ ] Valid Supabase user without an active admin row is denied.
- [ ] Logout clears the admin session.
- [ ] Product search, filters, sorting, and pagination work.
- [ ] Add product validates and saves.
- [ ] Edit product validates and saves.
- [ ] Delete product requires confirmation.
- [ ] Active, featured, best-seller, and new-arrival toggles persist.
- [ ] Stock, SKU, category, tags, and slug updates persist.
- [ ] Multiple product images upload and preview.
- [ ] Image type and 5 MB size validation work.
- [ ] Image deletion, reordering, primary selection, and alt text work.
- [ ] Order status update persists.
- [ ] Payment status update persists.
- [ ] Coupon create, edit, deactivate, and delete flows work.
- [ ] Coupon validation rejects invalid dates, values, and limits.
- [ ] Store settings update persists.
- [ ] Category, banner, and store asset uploads respect storage policies.

## Responsive and Accessibility

- [ ] Homepage is checked at 390 px, 768 px, 1024 px, and wide desktop.
- [ ] Shop, product, cart, checkout, account, login, and admin are checked on mobile.
- [ ] No horizontal page overflow appears.
- [ ] Mobile navigation and drawers open, trap focus where applicable, and close with Escape.
- [ ] All forms have visible labels and errors.
- [ ] Icon buttons have accessible names.
- [ ] Keyboard focus is visible.
- [ ] Heading order is logical.
- [ ] Product and content images have useful alt text.
- [ ] Reduced-motion preference is respected.
- [ ] Text and controls retain readable contrast.

## SEO and Routing

- [ ] Home, shop, product, about, and contact have unique titles and descriptions.
- [ ] Product pages output Product and Breadcrumb JSON-LD.
- [ ] Home outputs Organization and WebSite JSON-LD.
- [ ] Canonical URLs use the final HTTPS domain.
- [ ] Open Graph and Twitter metadata use valid titles, descriptions, and images.
- [ ] Cart, checkout, account, login, admin, and order confirmation are `noindex`.
- [ ] `/robots.txt` loads and references the production sitemap.
- [ ] `/sitemap.xml` loads and contains public pages and product URLs.
- [ ] `VITE_SITE_URL` matches the production domain.
- [ ] Direct refresh works for `/admin`.
- [ ] Direct refresh works for `/shop`.
- [ ] Direct refresh works for `/product/ivory-bagru-kurta`.
- [ ] Direct refresh works for `/account`.
- [ ] Direct refresh works for `/order-confirmation/TEST-ORDER`.
- [ ] Unknown routes render the application 404 page rather than Netlify's 404.

## Launch

- [ ] Production domain DNS and TLS are active.
- [ ] Supabase Auth Site URL matches the production origin.
- [ ] Required Supabase Auth redirect URLs are allowlisted.
- [ ] Razorpay production domain is verified and allowlisted.
- [ ] Live Razorpay keys replace test keys only after Test Mode passes.
- [ ] Analytics IDs are correct or intentionally blank.
- [ ] Support email, phone, WhatsApp number, address, and social links are final.
- [ ] A rollback deploy and database backup/recovery process are understood.
- [ ] Final smoke test is completed from a clean private browser session.
