import { createClient } from "npm:@supabase/supabase-js@2";

interface SendOtpBody {
  phone: string;
  resend: boolean;
}

interface Msg91Response {
  message?: string;
  request_id?: string;
  type?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Origin": "*",
};
const cooldownSeconds = 30;
const maxSendsPerHour = 5;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBody(value: unknown): SendOtpBody | null {
  if (!isRecord(value) || typeof value.phone !== "string") return null;
  const digits = value.phone.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return {
    phone: `91${digits}`,
    resend: value.resend === true,
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
    return json({ message: "Invalid OTP request." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authKey = Deno.env.get("MSG91_AUTH_KEY");
  const templateId = Deno.env.get("MSG91_TEMPLATE_ID");
  if (!supabaseUrl || !serviceRoleKey || !authKey || !templateId) {
    return json({ message: "OTP login is not configured yet." }, 503);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ message: "Enter a valid Indian mobile number." }, 400);
  }
  const body = parseBody(rawBody);
  if (!body) {
    return json({ message: "Enter a valid Indian mobile number." }, 400);
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const phoneHash = await sha256(body.phone);
  const now = Date.now();
  const { data: throttle } = await client
    .from("customer_otp_requests")
    .select("*")
    .eq("phone_hash", phoneHash)
    .maybeSingle();

  const lockedUntil = throttle?.locked_until
    ? new Date(throttle.locked_until).getTime()
    : 0;
  if (lockedUntil > now) {
    return json(
      { message: "Too many OTP attempts. Please try again later." },
      429,
    );
  }

  const lastSent = throttle?.last_sent_at
    ? new Date(throttle.last_sent_at).getTime()
    : 0;
  if (lastSent && now - lastSent < cooldownSeconds * 1000) {
    return json(
      {
        message: `Please wait ${cooldownSeconds} seconds before requesting another OTP.`,
      },
      429,
    );
  }

  const windowStarted = throttle?.window_started_at
    ? new Date(throttle.window_started_at).getTime()
    : 0;
  const inCurrentWindow = now - windowStarted < 60 * 60 * 1000;
  const sendCount = inCurrentWindow ? Number(throttle?.send_count ?? 0) : 0;
  if (sendCount >= maxSendsPerHour) {
    await client.from("customer_otp_requests").upsert({
      phone_hash: phoneHash,
      locked_until: new Date(now + 60 * 60 * 1000).toISOString(),
      send_count: sendCount,
      verify_count: Number(throttle?.verify_count ?? 0),
      window_started_at: new Date(
        windowStarted || now,
      ).toISOString(),
    });
    return json(
      { message: "Too many OTP requests. Please try again in one hour." },
      429,
    );
  }

  const url = body.resend
    ? new URL("https://control.msg91.com/api/v5/otp/retry")
    : new URL("https://control.msg91.com/api/v5/otp");
  if (body.resend) {
    url.searchParams.set("authkey", authKey);
    url.searchParams.set("mobile", body.phone);
    url.searchParams.set("retrytype", "text");
  } else {
    url.searchParams.set("authkey", authKey);
    url.searchParams.set("mobile", body.phone);
    url.searchParams.set("otp_expiry", "10");
    url.searchParams.set("otp_length", "6");
    url.searchParams.set("template_id", templateId);
  }

  const msg91Response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    method: body.resend ? "GET" : "POST",
  });
  let msg91Result: Msg91Response = {};
  try {
    msg91Result = (await msg91Response.json()) as Msg91Response;
  } catch {
    return json({ message: "OTP could not be sent. Please try again." }, 502);
  }
  if (!msg91Response.ok || msg91Result.type !== "success") {
    return json(
      {
        message:
          msg91Result.message ??
          "OTP could not be sent. Please try again.",
      },
      502,
    );
  }

  await client.from("customer_otp_requests").upsert({
    last_sent_at: new Date(now).toISOString(),
    locked_until: null,
    phone_hash: phoneHash,
    send_count: sendCount + 1,
    verify_count: inCurrentWindow
      ? Number(throttle?.verify_count ?? 0)
      : 0,
    window_started_at: new Date(
      inCurrentWindow ? windowStarted : now,
    ).toISOString(),
  });

  return json({
    cooldownSeconds,
    phone: `+${body.phone}`,
  });
});
