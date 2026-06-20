# Environment Variables

House of Patani has two separate environment boundaries:

- Netlify variables are used while building browser code.
- Supabase Edge Function secrets are available only to server-side functions.

Any variable prefixed with `VITE_` is public. Vite embeds it into the frontend
bundle. Never put a private key or service-role credential in a `VITE_`
variable.

## Frontend / Netlify

Set these in Netlify under Site configuration, Environment variables. Ensure
their scope includes Builds and add them to the Production context.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Public Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Yes | Public anonymous or publishable key protected by RLS. |
| `VITE_RAZORPAY_KEY_ID` | For online payment | Public Razorpay checkout Key ID. |
| `VITE_GA_MEASUREMENT_ID` | Optional | Google Analytics measurement ID such as `G-XXXXXXXXXX`. Analytics stays disabled when blank. |
| `VITE_META_PIXEL_ID` | Optional | Numeric Meta Pixel ID. Tracking stays disabled when blank. |
| `VITE_SITE_URL` | Yes | Final HTTPS origin used for canonicals and sitemap generation, for example `https://houseofpatani.com`. |

Example:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_anon_or_publishable_key
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
VITE_GA_MEASUREMENT_ID=
VITE_META_PIXEL_ID=
VITE_SITE_URL=https://houseofpatani.com
```

The Supabase anon key is intentionally usable in browser code. Security depends
on the Row Level Security policies in `supabase/migrations`, not on hiding that
key.

## Supabase Edge Function Secrets

These values belong in Supabase only:

| Variable | Required | Purpose |
| --- | --- | --- |
| `RAZORPAY_KEY_ID` | For online payment | Server-side Razorpay account Key ID; must match the frontend mode. |
| `RAZORPAY_KEY_SECRET` | For online payment | Signs and verifies Razorpay requests. Secret. |
| `MSG91_AUTH_KEY` | For OTP login | Authenticates server-to-server MSG91 requests. Secret. |
| `MSG91_TEMPLATE_ID` | For OTP login | Approved MSG91 OTP template identifier. |
| `MSG91_OTP_WIDGET_ID` | Optional | MSG91 widget identifier when the account flow uses one. |
| `SUPABASE_URL` | Platform provided | Hosted project URL available to Edge Functions. |
| `SUPABASE_SERVICE_ROLE_KEY` | Platform provided | Privileged server key used by trusted Edge Functions. Secret. |

Set custom provider secrets with:

```bash
npx supabase secrets set --env-file supabase/.env.production.local
npx supabase secrets list
```

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to hosted Edge
Functions. Do not copy the service-role key into Netlify, `.env.example`,
frontend source, browser storage, logs, analytics, or error messages.

## Forbidden Frontend Variables

These names must never appear in `src`, `public`, `index.html`, or `dist`:

- `RAZORPAY_KEY_SECRET`
- `MSG91_AUTH_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The production build runs `npm run check:secrets` before compilation and fails
if any forbidden server-secret name appears in frontend output.

## Rotation

When a provider key is rotated:

1. Update the Supabase secret first.
2. Update the matching public Key ID in Netlify when applicable.
3. Trigger a fresh Netlify production deploy for changed `VITE_` values.
4. Test the affected flow.
5. Revoke the old key after the new flow is confirmed.
