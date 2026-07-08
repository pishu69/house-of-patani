import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (request.method !== "POST") {
    return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "SERVER_NOT_CONFIGURED" }, 500);
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return json({ error: "INVALID_PAYLOAD" }, 400);
  }

  const event = payload as Record<string, unknown>;
  const orderNumber = String(
    event.order_id ?? event.order_number ?? event.channel_order_id ?? "",
  ).trim();

  if (!orderNumber) {
    return json({ ok: true, message: "Webhook received without order number." });
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const awbNumber = String(event.awb ?? event.awb_code ?? "").trim() || null;
  const courierName =
    String(event.courier_name ?? event.courier_company_name ?? "").trim() ||
    null;
  const shipmentId =
    String(event.shipment_id ?? event.shiprocket_shipment_id ?? "").trim() ||
    null;
  const shipmentStatus =
    String(
      event.shipment_status ??
        event.current_status ??
        event.current_shipment_status ??
        "",
    ).trim() || null;
  const trackingUrl =
    String(event.tracking_url ?? "").trim() ||
    (awbNumber ? `https://shiprocket.co/tracking/${awbNumber}` : null);

  const { error } = await client
    .from("orders")
    .update({
      awb_number: awbNumber,
      courier_name: courierName,
      courier_partner: courierName,
      shipment_id: shipmentId,
      shipment_status: shipmentStatus,
      tracking_number: awbNumber,
      tracking_url: trackingUrl,
    })
    .eq("order_number", orderNumber);

  if (error) {
    return json({ error: "ORDER_UPDATE_FAILED", message: error.message }, 500);
  }

  return json({ ok: true });
});
