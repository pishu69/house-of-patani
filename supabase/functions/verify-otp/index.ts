import { createClient } from "npm:@supabase/supabase-js@2";

interface CustomerAddressInput {
  city: string;
  country: string;
  isDefault: boolean;
  label: string;
  line1: string;
  line2: string;
  postalCode: string;
  state: string;
}

interface VerifyOtpBody {
  addresses: CustomerAddressInput[];
  email: string;
  name: string;
  otp: string;
  phone: string;
  wishlistProductIds: string[];
}

interface Msg91Response {
  message?: string;
  type?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Origin": "*",
};
const maxVerifyAttempts = 5;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAddress(value: unknown): CustomerAddressInput | null {
  if (
    !isRecord(value) ||
    typeof value.line1 !== "string" ||
    typeof value.line2 !== "string" ||
    typeof value.city !== "string" ||
    typeof value.state !== "string" ||
    typeof value.postalCode !== "string" ||
    typeof value.country !== "string" ||
    typeof value.label !== "string"
  ) {
    return null;
  }
  if (
    value.line1.trim().length < 5 ||
    !/^[1-9][0-9]{5}$/.test(value.postalCode)
  ) {
    return null;
  }
  return {
    city: value.city.trim().slice(0, 100),
    country: value.country.trim().slice(0, 100),
    isDefault: value.isDefault === true,
    label: value.label.trim().slice(0, 40),
    line1: value.line1.trim().slice(0, 160),
    line2: value.line2.trim().slice(0, 160),
    postalCode: value.postalCode,
    state: value.state.trim().slice(0, 100),
  };
}

function parseBody(value: unknown): VerifyOtpBody | null {
  if (
    !isRecord(value) ||
    typeof value.phone !== "string" ||
    typeof value.otp !== "string" ||
    typeof value.name !== "string" ||
    typeof value.email !== "string" ||
    !Array.isArray(value.addresses) ||
    !Array.isArray(value.wishlistProductIds)
  ) {
    return null;
  }
  const digits = value.phone.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(digits) || !/^\d{4,9}$/.test(value.otp)) {
    return null;
  }
  const addresses = value.addresses.flatMap<CustomerAddressInput>(
    (address) => {
      const parsed = parseAddress(address);
      return parsed ? [parsed] : [];
    },
  );
  if (addresses.length !== value.addresses.length || addresses.length > 10) {
    return null;
  }
  const wishlistProductIds = value.wishlistProductIds.flatMap<string>(
    (productId) =>
      typeof productId === "string" && productId.length <= 80
        ? [productId]
        : [],
  );
  if (
    wishlistProductIds.length !== value.wishlistProductIds.length ||
    wishlistProductIds.length > 100
  ) {
    return null;
  }
  const email = value.email.trim().toLowerCase();
  if (
    email &&
    (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    return null;
  }
  return {
    addresses,
    email,
    name: value.name.trim().slice(0, 120),
    otp: value.otp,
    phone: `91${digits}`,
    wishlistProductIds: [...new Set(wishlistProductIds)],
  };
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ message: "Method not allowed." }, 405);
  }
  if (!request.headers.get("authorization")?.startsWith("Bearer ")) {
    return json({ message: "Invalid OTP verification request." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authKey = Deno.env.get("MSG91_AUTH_KEY");
  if (!supabaseUrl || !serviceRoleKey || !authKey) {
    return json({ message: "OTP login is not configured yet." }, 503);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ message: "Invalid OTP verification request." }, 400);
  }
  const body = parseBody(rawBody);
  if (!body) {
    return json({ message: "Enter a valid mobile number and OTP." }, 400);
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const phoneHash = await sha256(body.phone);
  const { data: throttle } = await client
    .from("customer_otp_requests")
    .select("*")
    .eq("phone_hash", phoneHash)
    .maybeSingle();
  const now = Date.now();
  if (
    throttle?.locked_until &&
    new Date(throttle.locked_until).getTime() > now
  ) {
    return json(
      { message: "Too many OTP attempts. Please try again later." },
      429,
    );
  }
  const verifyCount = Number(throttle?.verify_count ?? 0);
  if (verifyCount >= maxVerifyAttempts) {
    await client.from("customer_otp_requests").upsert({
      ...throttle,
      locked_until: new Date(now + 60 * 60 * 1000).toISOString(),
      phone_hash: phoneHash,
    });
    return json(
      { message: "Too many OTP attempts. Please try again in one hour." },
      429,
    );
  }
  await client.from("customer_otp_requests").upsert({
    ...throttle,
    phone_hash: phoneHash,
    verify_count: verifyCount + 1,
    window_started_at: throttle?.window_started_at ?? new Date().toISOString(),
  });

  const verifyUrl = new URL(
    "https://control.msg91.com/api/v5/otp/verify",
  );
  verifyUrl.searchParams.set("authkey", authKey);
  verifyUrl.searchParams.set("mobile", body.phone);
  verifyUrl.searchParams.set("otp", body.otp);
  const msg91Response = await fetch(verifyUrl, {
    method: "GET",
  });
  let msg91Result: Msg91Response = {};
  try {
    msg91Result = (await msg91Response.json()) as Msg91Response;
  } catch {
    return json(
      { message: "OTP verification is temporarily unavailable." },
      502,
    );
  }
  if (!msg91Response.ok || msg91Result.type !== "success") {
    return json(
      {
        message:
          msg91Result.message === "OTP expired"
            ? "The OTP has expired. Request a new code."
            : "The OTP is incorrect or has expired.",
      },
      400,
    );
  }

  const authEmail = `phone-${body.phone}@auth.houseofpatani.invalid`;
  const { data: linkData, error: linkError } =
    await client.auth.admin.generateLink({
      email: authEmail,
      options: {
        data: {
          customer_phone: `+${body.phone}`,
          login_provider: "msg91",
        },
      },
      type: "magiclink",
    });
  if (linkError || !linkData.user || !linkData.properties?.hashed_token) {
    return json({ message: "Customer login could not be completed." }, 500);
  }

  const { data: account, error: accountError } = await client.rpc(
    "complete_customer_otp_login",
    {
      p_addresses: body.addresses,
      p_auth_user_id: linkData.user.id,
      p_email: body.email,
      p_name: body.name,
      p_phone: `+${body.phone}`,
      p_wishlist_product_ids: body.wishlistProductIds,
    },
  );
  if (accountError || !account) {
    return json({ message: "Customer account could not be prepared." }, 500);
  }

  await client
    .from("customer_otp_requests")
    .delete()
    .eq("phone_hash", phoneHash);

  return json({
    account,
    tokenHash: linkData.properties.hashed_token,
  });
});

