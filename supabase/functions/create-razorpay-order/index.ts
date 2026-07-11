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
  discount: number;
  items: CheckoutItem[];
  shipping: number;
  subtotal: number;
  total: number;
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

function isValidMoney(value: unknown) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 10_00_000
  );
}

function parseBody(value: unknown): CreateOrderBody | null {
  if (
    !isRecord(value) ||
    typeof value.customerEmail !== "string" ||
    typeof value.customerName !== "string" ||
    typeof value.customerPhone !== "string" ||
    !isRecord(value.address) ||
    !Array.isArray(value.items) ||
    !isValidMoney(value.discount) ||
    !isValidMoney(value.shipping) ||
    !isValidMoney(value.subtotal) ||
    !isValidMoney(value.total)
  ) {
    return null;
  }

  const customerEmail = value.customerEmail.trim().toLowerCase();
  const customerName = value.customerName.trim();
  const customerPhone = value.customerPhone.trim();
  const phoneDigits = customerPhone.replace(/\D/g, "");

  if (
    customerName.length < 2 ||
    customerName.length > 120 ||
    customerEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ||
    phoneDigits.length < 10 ||
    phoneDigits.length > 15 ||
    value.items.length === 0 ||
    value.items.length > 25
  ) {
    return null;
  }

  const items = value.items.flatMap<CheckoutItem>((item) => {
    if (
      !isRecord(item) ||
      typeof item.sku !== "string" ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20 ||
      item.sku.length < 1 ||
      item.sku.length > 64
    ) {
      return [];
    }

    return [{ quantity: item.quantity, sku: item.sku }];
  });

  if (items.length !== value.items.length || items.length === 0) return null;
  if (new Set(items.map((item) => item.sku)).size !== items.length) return null;

  const address = Object.fromEntries(
    Object.entries(value.address).flatMap(([key, item]) =>
      typeof item === "string" && item.trim().length <= 240
        ? [[key, item.trim()]]
        : [],
    ),
  );

  const requiredAddressFields = [
    "addressLine1",
    "city",
    "state",
    "pincode",
    "country",
  ];

  if (
    requiredAddressFields.some(
      (key) => !address[key] || address[key].length < 2,
    ) ||
    !/^\d{6}$/.test(address.pincode ?? "")
  ) {
    return null;
  }

  return {
    address,
    customerEmail,
    customerName,
    customerPhone,
    discount: Math.round(value.discount),
    items,
    shipping: Math.round(value.shipping),
    subtotal: Math.round(value.subtotal),
    total: Math.round(value.total),
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ message: "Method not allowed." }, 405);
  }

  if (!request.headers.get("authorization")?.startsWith("Bearer ")) {
    return json({ message: "Invalid payment request." }, 401);
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

  let verifiedSubtotal = 0;

  for (const item of body.items) {
    const product = products.find((candidate) => candidate.sku === item.sku);

    if (!product || !product.active || product.stock < item.quantity) {
      return json({ message: "One or more products are out of stock." }, 409);
    }

    verifiedSubtotal += Number(product.price) * item.quantity;
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

  const verifiedShipping =
    verifiedSubtotal === 0 || verifiedSubtotal >= threshold ? 0 : shippingCharge;

  if (Math.round(body.subtotal) !== Math.round(verifiedSubtotal)) {
    return json({ message: "The order subtotal is invalid." }, 400);
  }

  if (Math.round(body.shipping) !== Math.round(verifiedShipping)) {
    return json({ message: "The shipping amount is invalid." }, 400);
  }

  const verifiedDiscount = Math.min(
    Math.round(verifiedSubtotal),
    Math.max(0, Math.round(body.discount)),
  );

  const verifiedTotal =
    Math.round(verifiedSubtotal) - verifiedDiscount + Math.round(verifiedShipping);

  if (Math.round(body.total) !== verifiedTotal) {
    return json({ message: "The order total is invalid." }, 400);
  }

  const amountInPaise = Math.round(verifiedTotal * 100);

  if (!Number.isSafeInteger(amountInPaise) || amountInPaise < 100) {
    return json({ message: "The order total is invalid." }, 400);
  }

  const { data: intent, error: intentError } = await client
    .from("payment_intents")
    .insert({
      amount: verifiedTotal,
      currency: "INR",
      discount: verifiedDiscount,
      customer_email: body.customerEmail,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      items: body.items,
      shipping: verifiedShipping,
      shipping_address: body.address,
      status: "created",
      subtotal: verifiedSubtotal,
    })
    .select("id")
    .single();

  if (intentError || !intent) {
    return json({ message: "Payment could not be prepared." }, 500);
  }

  const receipt = `hop_${intent.id.replaceAll("-", "").slice(0, 28)}`;

  const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      notes: {
        discount: String(verifiedDiscount),
        intent_id: intent.id,
        shipping: String(verifiedShipping),
        subtotal: String(verifiedSubtotal),
      },
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

  if (
    typeof razorpayOrder.id !== "string" ||
    typeof razorpayOrder.amount !== "number" ||
    razorpayOrder.currency !== "INR" ||
    typeof razorpayOrder.receipt !== "string" ||
    razorpayOrder.amount !== amountInPaise
  ) {
    await client
      .from("payment_intents")
      .update({ status: "failed" })
      .eq("id", intent.id);

    return json({ message: "Online payment is temporarily unavailable." }, 502);
  }

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
