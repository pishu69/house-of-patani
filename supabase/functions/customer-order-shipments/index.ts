import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizePhone(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").slice(-10);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ message: "Method not allowed." }, 405);
  }

  try {
    const body = await request.json();
    const orderId = String(body?.orderId ?? "").trim();
    const customerEmail = normalizeEmail(body?.customerEmail);
    const customerPhone = normalizePhone(body?.customerPhone);

    if (!orderId || (!customerEmail && !customerPhone)) {
      return json({ message: "Order verification details are required." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase service credentials are unavailable.");
    }

    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
    const { data: order, error: orderError } = await client
      .from("orders")
      .select("id, customer_email, customer_phone")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) throw orderError;
    const contactMatches =
      order &&
      ((customerEmail &&
        normalizeEmail(order.customer_email) === customerEmail) ||
        (customerPhone &&
          normalizePhone(order.customer_phone) === customerPhone));

    if (!contactMatches) {
      return json({ message: "Order not found." }, 404);
    }

    const { data, error } = await client
      .from("order_shipments")
      .select(
        "id, awb_number, created_at, estimated_delivery_date, shipment_status, tracking_url, updated_at",
      )
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return json({ shipments: data ?? [] });
  } catch (error) {
    console.error("Customer shipment lookup failed.", error);
    return json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Shipment tracking could not be loaded.",
      },
      500,
    );
  }
});
