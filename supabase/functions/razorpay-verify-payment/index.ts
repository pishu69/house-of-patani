import { createClient } from "npm:@supabase/supabase-js@2";

interface VerifyBody {
  intentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

interface RazorpayPayment {
  amount: number;
  id: string;
  order_id: string;
  status: string;
}

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Origin": "*",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBody(value: unknown): VerifyBody | null {
  if (
    !isRecord(value) ||
    typeof value.intentId !== "string" ||
    typeof value.razorpayOrderId !== "string" ||
    typeof value.razorpayPaymentId !== "string" ||
    typeof value.razorpaySignature !== "string"
  ) {
    return null;
  }

  if (
    !/^[0-9a-f-]{36}$/i.test(value.intentId) ||
    !/^order_[A-Za-z0-9]+$/.test(value.razorpayOrderId) ||
    !/^pay_[A-Za-z0-9]+$/.test(value.razorpayPaymentId) ||
    !/^[a-f0-9]{64}$/i.test(value.razorpaySignature)
  ) {
    return null;
  }

  return {
    intentId: value.intentId,
    razorpayOrderId: value.razorpayOrderId,
    razorpayPaymentId: value.razorpayPaymentId,
    razorpaySignature: value.razorpaySignature,
  };
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ message: "Method not allowed." }, 405);
  }

  if (!request.headers.get("authorization")?.startsWith("Bearer ")) {
    return json({ message: "Invalid verification request." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

  if (!supabaseUrl || !serviceRoleKey || !keyId || !keySecret) {
    return json({ message: "Payment verification is not configured." }, 503);
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return json({ message: "Invalid verification request." }, 400);
  }

  const body = parseBody(requestBody);
  if (!body) return json({ message: "Invalid verification request." }, 400);

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const { data: intent, error: intentError } = await client
    .from("payment_intents")
    .select("id, amount, razorpay_order_id, status")
    .eq("id", body.intentId)
    .single();

  if (intentError || !intent) {
    return json({ message: "Payment intent was not found." }, 404);
  }

  if (intent.razorpay_order_id !== body.razorpayOrderId) {
    return json({ message: "Payment reference did not match." }, 400);
  }

  if (intent.status !== "created" && intent.status !== "paid") {
    return json({ message: "This payment session is no longer active." }, 409);
  }

  const signingKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keySecret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = toHex(
    await crypto.subtle.sign(
      "HMAC",
      signingKey,
      new TextEncoder().encode(
        `${intent.razorpay_order_id}|${body.razorpayPaymentId}`,
      ),
    ),
  );

  if (!timingSafeEqual(signature, body.razorpaySignature)) {
    return json({ message: "Payment verification failed." }, 400);
  }

  const paymentResponse = await fetch(
    `https://api.razorpay.com/v1/payments/${body.razorpayPaymentId}`,
    {
      headers: {
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      },
    },
  );

  if (!paymentResponse.ok) {
    return json({ message: "Payment status could not be verified." }, 502);
  }

  const payment = (await paymentResponse.json()) as RazorpayPayment;
  if (
    payment.order_id !== intent.razorpay_order_id ||
    payment.amount !== Math.round(Number(intent.amount) * 100) ||
    payment.status !== "captured"
  ) {
    return json({ message: "Payment has not been captured." }, 409);
  }

  const { data, error } = await client.rpc("finalize_razorpay_order", {
    p_intent_id: intent.id,
    p_razorpay_order_id: body.razorpayOrderId,
    p_razorpay_payment_id: body.razorpayPaymentId,
    p_razorpay_signature: body.razorpaySignature,
  });

  if (error) {
    return json({ message: "Paid order could not be finalised." }, 409);
  }

  return json(data);
});
