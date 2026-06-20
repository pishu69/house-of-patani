import { createClient } from "npm:@supabase/supabase-js@2";

interface CheckoutItem {
  quantity: number;
  sku: string;
}

interface CreateOrderBody {
  address: Record<string, string>;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: CheckoutItem[];
}

interface RazorpayOrder {
  amount: number;
  currency: string;
  id: string;
  receipt: string;
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

function parseBody(value: unknown): CreateOrderBody | null {
  if (
    !isRecord(value) ||
    typeof value.customerEmail !== "string" ||
    typeof value.customerName !== "string" ||
    typeof value.customerPhone !== "string" ||
    !isRecord(value.address) ||
    !Array.isArray(value.items)
  ) {
    return null;
  }

  const items = value.items.flatMap<CheckoutItem>((item) => {
    if (
      !isRecord(item) ||
      typeof item.sku !== "string" ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return [];
    }
    return [{ quantity: item.quantity, sku: item.sku }];
  });

  if (items.length !== value.items.length || items.length === 0) return null;

  const address = Object.fromEntries(
    Object.entries(value.address).flatMap(([key, item]) =>
      typeof item === "string" ? [[key, item]] : [],
    ),
  );

  return {
    address,
    customerEmail: value.customerEmail.trim().toLowerCase(),
    customerName: value.customerName.trim(),
    customerPhone: value.customerPhone.trim(),
    items,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ message: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

  if (!supabaseUrl || !serviceRoleKey || !keyId || !keySecret) {
    return json({ message: "Online payment is not configured." }, 503);
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return json({ message: "Invalid payment request." }, 400);
  }

  const body = parseBody(requestBody);
  if (!body) return json({ message: "Invalid payment request." }, 400);

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const skus = body.items.map((item) => item.sku);
  const { data: products, error: productsError } = await client
    .from("products")
    .select("id, name, price, sku, stock, active")
    .in("sku", skus);

  if (productsError || !products || products.length !== skus.length) {
    return json({ message: "One or more products are unavailable." }, 409);
  }

  let subtotal = 0;
  for (const item of body.items) {
    const product = products.find((candidate) => candidate.sku === item.sku);
    if (!product || !product.active || product.stock < item.quantity) {
      return json({ message: "One or more products are out of stock." }, 409);
    }
    subtotal += Number(product.price) * item.quantity;
  }

  const { data: settingRow } = await client
    .from("settings")
    .select("value")
    .eq("key", "store")
    .maybeSingle();
  const settings = isRecord(settingRow?.value) ? settingRow.value : {};
  const threshold =
    typeof settings.freeShippingThreshold === "number"
      ? settings.freeShippingThreshold
      : 5000;
  const shippingCharge =
    typeof settings.shippingCharge === "number"
      ? settings.shippingCharge
      : 250;
  const total = subtotal + (subtotal >= threshold ? 0 : shippingCharge);

  const { data: intent, error: intentError } = await client
    .from("payment_intents")
    .insert({
      amount: total,
      currency: "INR",
      customer_email: body.customerEmail,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      items: body.items,
      shipping_address: body.address,
      status: "created",
    })
    .select("id")
    .single();

  if (intentError || !intent) {
    return json({ message: "Payment could not be prepared." }, 500);
  }

  const receipt = `hop_${intent.id.replaceAll("-", "").slice(0, 28)}`;
  const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
    body: JSON.stringify({
      amount: Math.round(total * 100),
      currency: "INR",
      notes: { intent_id: intent.id },
      receipt,
    }),
    headers: {
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!razorpayResponse.ok) {
    await client
      .from("payment_intents")
      .update({ status: "failed" })
      .eq("id", intent.id);
    return json({ message: "Online payment is temporarily unavailable." }, 502);
  }

  const razorpayOrder = (await razorpayResponse.json()) as RazorpayOrder;
  await client
    .from("payment_intents")
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq("id", intent.id);

  return json({
    amount: razorpayOrder.amount,
    currency: "INR",
    id: intent.id,
    razorpayOrderId: razorpayOrder.id,
    receipt: razorpayOrder.receipt,
  });
});
