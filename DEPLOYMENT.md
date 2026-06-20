# House of Patani Deployment Guide

This guide deploys the storefront to Netlify and the database, authentication,
storage, and server functions to Supabase.

## 1. Prerequisites

- A production Supabase project.
- A Netlify account connected to the repository.
- Node.js 22.12 or later.
- Supabase CLI access through `npx supabase`.
- Razorpay and MSG91 accounts when those production features are enabled.
- Access to the production DNS provider.

Never commit production `.env` files, private API keys, OTP credentials, or the
Supabase service-role key.

## 2. Create and Link the Supabase Project

1. Create a project in the Supabase dashboard and retain its project reference.
2. From the repository root, authenticate and link the CLI:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

The CLI may request the production database password during linking or pushes.

## 3. Apply Database Migrations

Migrations must be applied in this exact timestamp order:

1. `20260620000000_initial_schema.sql`
2. `20260620010000_expand_order_statuses.sql`
3. `20260620020000_storage_and_product_media.sql`
4. `20260620030000_guest_checkout.sql`
5. `20260620040000_razorpay_payments.sql`
6. `20260620050000_admin_security.sql`
7. `20260620060000_customer_order_lookup.sql`
8. `20260620070000_customer_otp_auth.sql`

Review local and remote migration state, then push:

```bash
npx supabase migration list
npx supabase db push
npx supabase migration list
```

Do not make untracked production schema changes in the Supabase Table Editor or
SQL Editor. Add future changes as migrations and deploy them with `db push`.

## 4. Verify Storage

The `20260620020000_storage_and_product_media.sql` migration creates and
configures these public buckets:

- `product-images`
- `category-images`
- `banner-images`
- `store-assets`

Each bucket accepts JPEG, PNG, and WebP images up to 5 MB. Public reads are
allowed; uploads, updates, and deletions require an active administrator.

After migrations finish, verify all four buckets in Supabase Storage. Do not
create duplicate buckets manually.

## 5. Configure Edge Function Secrets

Create a temporary local file outside version control, for example
`supabase/.env.production.local`:

```dotenv
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=replace_with_live_secret
MSG91_AUTH_KEY=replace_with_msg91_auth_key
MSG91_TEMPLATE_ID=replace_with_msg91_template_id
MSG91_OTP_WIDGET_ID=replace_if_used
```

Upload the secrets and confirm their names:

```bash
npx supabase secrets set --env-file supabase/.env.production.local
npx supabase secrets list
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to hosted Supabase
Edge Functions by Supabase. They are server-only values. Never add the
service-role key to Netlify or a `VITE_` variable.

Delete the temporary secrets file after use or keep it in a secure password
manager-backed workflow. It is ignored when named as an `.env` file, but it
must still never be committed.

## 6. Deploy Edge Functions

Deploy the four function directories exactly as named:

```bash
npx supabase functions deploy send-otp
npx supabase functions deploy verify-otp
npx supabase functions deploy create-razorpay-order
npx supabase functions deploy verify-razorpay-payment
```

All four functions validate request bodies and require the authorization header
provided by the Supabase client. Razorpay signature and captured-payment checks
remain server-side.

Review function logs in the Supabase dashboard after one test request to each
flow. Client-facing errors must remain generic and must not include provider or
database secrets.

## 7. Create the First Administrator

1. In Supabase Authentication, create an email/password user for the
   administrator.
2. Mark the email as confirmed.
3. In the SQL Editor, add the Auth user to `public.admins`:

```sql
insert into public.admins (user_id, name, email, role, active)
select
  id,
  'Store Administrator',
  lower(email),
  'super_admin',
  true
from auth.users
where lower(email) = lower('ADMIN_EMAIL@example.com')
on conflict (user_id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role,
  active = true;
```

Confirm that exactly one row was affected. Test `/admin/login` in a private
browser session. A valid Supabase user without an active `admins` row must be
denied.

## 8. Configure Razorpay

1. Start with Razorpay Test Mode keys.
2. Set the test Key ID in Netlify as `VITE_RAZORPAY_KEY_ID`.
3. Set the same Key ID and its secret in Supabase as `RAZORPAY_KEY_ID` and
   `RAZORPAY_KEY_SECRET`.
4. Run the complete payment-success, dismissal, and failure flows.
5. Before launch, complete Razorpay account and website verification, whitelist
   the production domain, and replace all test keys with Live Mode keys.

The Key ID is public. The Key Secret is server-only and must exist only as a
Supabase Edge Function secret.

## 9. Configure MSG91

1. Create and approve the OTP template in MSG91.
2. Record the authentication key and template ID.
3. Set `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID` as Supabase secrets.
4. Set `MSG91_OTP_WIDGET_ID` only if the account configuration requires it.
5. Test send, resend cooldown, invalid OTP, expired OTP, attempt throttling, and
   successful login with an Indian mobile number.

The current functions use MSG91's server-side OTP send and verify APIs. No
MSG91 secret belongs in Netlify or browser code.

## 10. Deploy to Netlify

1. Import the Git repository into Netlify.
2. Use `npm run build` as the build command.
3. Use `dist` as the publish directory.
4. Add the frontend variables from `ENVIRONMENT_VARIABLES.md` to the Netlify
   Production context.
5. Deploy and inspect the complete build log.

`netlify.toml` pins Node.js, defines security/cache headers, and rewrites SPA
routes to `index.html`. `public/_redirects` supplies the same SPA fallback in
the published output.

After deployment, directly open and refresh:

- `/admin`
- `/shop`
- `/product/ivory-bagru-kurta`
- `/account`
- `/order-confirmation/TEST-ORDER`

Every route must return the application rather than Netlify's 404 page.

## 11. Production Security Audit

The repository currently enforces these production boundaries:

- `npm run check:secrets` scans frontend sources and `dist` for
  `RAZORPAY_KEY_SECRET`, `MSG91_AUTH_KEY`, and
  `SUPABASE_SERVICE_ROLE_KEY`.
- Demo administrator access requires `import.meta.env.DEV` and is unavailable
  in production builds.
- Demo customer OTP requires `import.meta.env.DEV` and is unavailable in
  production builds.
- All admin routes are wrapped by `AdminRouteGuard`.
- Admin sessions must map to an active row in `public.admins`.
- RLS policies allow public reads only for active catalog/public content and
  authorize protected writes through `public.is_admin()`.
- Storage policies allow public image reads and active-admin writes only.
- Payment intent creation, Razorpay signature verification, captured-payment
  verification, and service-role database operations run in Edge Functions.

Re-run the build-time scan after every environment or payment/authentication
change:

```bash
npm run check:secrets
```

Finding the secret variable names inside `supabase/functions` or deployment
documentation is expected. Finding them in `src`, `public`, `index.html`, or
`dist` is a release blocker.

## 12. Domain and Auth URLs

1. Add the production domain in Netlify and configure the DNS records Netlify
   provides.
2. Wait for Netlify TLS to become active.
3. Set `VITE_SITE_URL` to the final HTTPS origin and redeploy.
4. In Supabase Authentication URL Configuration, set the Site URL to the same
   production origin.
5. Add only required production and preview redirect URLs.
6. Whitelist the final domain in Razorpay before enabling Live Mode.
7. Confirm canonical URLs, sitemap URLs, and social metadata use the final
   production origin.

## 13. Final Release Test

Complete every item in `PRODUCTION_CHECKLIST.md` in a production-context deploy.
Use test payment credentials first. Enable live Razorpay keys only after the
test suite passes and COD, OTP, admin, storage, and route-refresh behavior have
all been verified.

## Reference Documentation

- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Supabase database migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Supabase Edge Function deployment](https://supabase.com/docs/guides/functions/deploy)
- [Supabase Edge Function secrets](https://supabase.com/docs/guides/functions/secrets)
- [Netlify SPA redirects](https://docs.netlify.com/manage/routing/redirects/redirect-options/#history-pushstate-and-single-page-apps)
- [Netlify build environment variables](https://docs.netlify.com/build/configure-builds/environment-variables/)
- [Razorpay Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- [Razorpay API keys](https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/)
