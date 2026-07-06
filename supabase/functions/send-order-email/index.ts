import { createClient } from "npm:@supabase/supabase-js@2";

interface EmailBody {
  orderId?: string;
  orderNumber?: string;
}

interface OrderRow {
  confirmation_email_sent_at: string | null;
  created_at: string;
  customer_email: string;
  customer_name: string;
  discount: number | string;
  id: string;
  order_number: string;
  order_status: string;
  payment_method: string;
  payment_status: string;
  shipping: number | string;
  shipping_address: Record<string, unknown>;
  subtotal: number | string;
  total: number | string;
}

interface OrderItemRow {
  price: number | string;
  product_name: string;
  quantity: number;
  total: number | string;
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

function parseBody(value: unknown): EmailBody | null {
  if (!isRecord(value)) return null;

  const orderId =
    typeof value.orderId === "string" ? value.orderId.trim() : undefined;
  const orderNumber =
    typeof value.orderNumber === "string"
      ? value.orderNumber.trim()
      : undefined;

  if (orderId && /^[0-9a-f-]{36}$/i.test(orderId)) return { orderId };
  if (orderNumber && orderNumber.length <= 64) return { orderNumber };

  return null;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function money(value: number | string) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number(value));
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function addressLine(address: Record<string, unknown>, key: string) {
  const value = address[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function buildAddress(address: Record<string, unknown>) {
  return [
    addressLine(address, "addressLine1"),
    addressLine(address, "addressLine2"),
    addressLine(address, "landmark"),
    [
      addressLine(address, "city"),
      addressLine(address, "state"),
      addressLine(address, "pincode"),
    ]
      .filter(Boolean)
      .join(", "),
    addressLine(address, "country"),
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function buildEmailHtml(order: OrderRow, items: OrderItemRow[]) {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #eadfd9;">
            <div style="font-size:15px;font-weight:600;color:#2f201c;">${escapeHtml(
              item.product_name,
            )}</div>
            <div style="margin-top:4px;font-size:13px;color:#7b6b63;">Qty ${escapeHtml(
              item.quantity,
            )} x ${money(item.price)}</div>
          </td>
          <td align="right" style="padding:14px 0;border-bottom:1px solid #eadfd9;font-size:15px;font-weight:600;color:#2f201c;">${money(
            item.total,
          )}</td>
        </tr>`,
    )
    .join("");

  const summaryRows = [
    ["Subtotal", money(order.subtotal)],
    ["Shipping", money(order.shipping)],
    ["Discount", money(order.discount)],
    ["Total", money(order.total)],
  ]
    .map(
      ([label, value], index) => `
        <tr>
          <td style="padding:${index === 3 ? "14px" : "8px"} 0;color:${
            index === 3 ? "#2f201c" : "#7b6b63"
          };font-size:${index === 3 ? "17px" : "14px"};font-weight:${
            index === 3 ? "700" : "400"
          };">${label}</td>
          <td align="right" style="padding:${
            index === 3 ? "14px" : "8px"
          } 0;color:#2f201c;font-size:${
            index === 3 ? "17px" : "14px"
          };font-weight:${index === 3 ? "700" : "600"};">${value}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8f3ef;font-family:Arial,Helvetica,sans-serif;color:#2f201c;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f3ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fffaf6;border:1px solid #eadfd9;">
            <tr>
              <td style="padding:34px 32px 24px;text-align:center;border-bottom:1px solid #eadfd9;">
                <div style="font-family:Georgia,serif;font-size:30px;letter-spacing:1px;color:#5f1e2d;">House of Patani</div>
                <div style="margin-top:10px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#9a7b65;">Order confirmed</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:26px;line-height:1.25;color:#2f201c;">Thank you for your order.</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#6f5f57;">Dear ${escapeHtml(
                  order.customer_name,
                )}, your House of Patani order has been received and is now being prepared with care.</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:26px;background:#f8f3ef;border:1px solid #eadfd9;">
                  <tr>
                    <td style="padding:18px 20px;font-size:14px;color:#7b6b63;">Order number<br><strong style="display:block;margin-top:5px;color:#2f201c;font-size:16px;">${escapeHtml(
                      order.order_number,
                    )}</strong></td>
                    <td style="padding:18px 20px;font-size:14px;color:#7b6b63;">Order date<br><strong style="display:block;margin-top:5px;color:#2f201c;font-size:16px;">${escapeHtml(
                      new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium",
                        timeZone: "Asia/Kolkata",
                      }).format(new Date(order.created_at)),
                    )}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:0 20px 18px;font-size:14px;color:#7b6b63;">Payment method<br><strong style="display:block;margin-top:5px;color:#2f201c;font-size:15px;">${escapeHtml(
                      humanize(order.payment_method),
                    )}</strong></td>
                    <td style="padding:0 20px 18px;font-size:14px;color:#7b6b63;">Status<br><strong style="display:block;margin-top:5px;color:#2f201c;font-size:15px;">${escapeHtml(
                      humanize(order.payment_status),
                    )} / ${escapeHtml(humanize(order.order_status))}</strong></td>
                  </tr>
                </table>

                <h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:20px;color:#2f201c;">Items ordered</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                  ${itemRows}
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                  ${summaryRows}
                </table>

                <h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:20px;color:#2f201c;">Delivery address</h2>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#6f5f57;">${buildAddress(
                  order.shipping_address,
                )}</p>

                <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#6f5f57;">We will share shipping updates as your order moves ahead. Shipping timelines and returns are handled as per the House of Patani shipping and returns policy.</p>
                <p style="margin:0;font-size:14px;line-height:1.7;color:#6f5f57;">For support, write to <a href="mailto:hello@houseofpatani.com" style="color:#5f1e2d;text-decoration:none;font-weight:600;">hello@houseofpatani.com</a>.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px;background:#5f1e2d;color:#fffaf6;text-align:center;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">House of Patani</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ message: "Method not allowed." }, 405);
  }

  if (!request.headers.get("authorization")?.startsWith("Bearer ")) {
    return json({ message: "Invalid email request." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const emailFrom =
    Deno.env.get("EMAIL_FROM") ?? "House of Patani <hello@houseofpatani.com>";

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !emailFrom) {
    return json({ message: "Order email is not configured." }, 503);
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return json({ message: "Invalid email request." }, 400);
  }

  const body = parseBody(requestBody);
  if (!body) return json({ message: "Invalid email request." }, 400);

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  let orderQuery = client
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, shipping_address, subtotal, discount, shipping, total, payment_method, payment_status, order_status, created_at, confirmation_email_sent_at",
    );

  orderQuery = body.orderId
    ? orderQuery.eq("id", body.orderId)
    : orderQuery.eq("order_number", body.orderNumber);

  const { data: order, error: orderError } = await orderQuery
    .maybeSingle<OrderRow>();

  if (orderError) {
    console.error("send-order-email order load failed", orderError);
    return json({ message: "Order could not be loaded." }, 500);
  }
  if (!order) return json({ message: "Order was not found." }, 404);

  if (order.confirmation_email_sent_at) {
    return json({ skipped: true });
  }

  const { data: items, error: itemsError } = await client
    .from("order_items")
    .select("product_name, price, quantity, total")
    .eq("order_id", order.id)
    .order("id", { ascending: true })
    .returns<OrderItemRow[]>();

  if (itemsError || !items?.length) {
    console.error("send-order-email items load failed", itemsError);
    return json({ message: "Order items could not be loaded." }, 500);
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: emailFrom,
      html: buildEmailHtml(order, items),
      subject: "Your House of Patani order is confirmed",
      to: [order.customer_email],
    }),
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!resendResponse.ok) {
    const resendError = await resendResponse.text();
    console.error("send-order-email resend failed", resendResponse.status, resendError);
    return json({ message: "Order email could not be sent." }, 502);
  }

  const resendData = await resendResponse.json();
  const { error: updateError } = await client
    .from("orders")
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", order.id)
    .is("confirmation_email_sent_at", null);

  if (updateError) {
    console.error("send-order-email status update failed", updateError);
    return json({ message: "Order email status could not be updated." }, 500);
  }

  return json({ id: resendData.id, sent: true });
});

