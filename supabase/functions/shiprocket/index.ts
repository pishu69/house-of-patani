import { createClient } from "npm:@supabase/supabase-js@2";

const SHIPROCKET_API_BASE = "https://apiv2.shiprocket.in/v1/external";
const DEFAULT_WEIGHT_KG = 0.7;
const DEFAULT_LENGTH_CM = 30;
const DEFAULT_BREADTH_CM = 25;
const DEFAULT_HEIGHT_CM = 5;

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

let cachedToken: string | null = null;
let cachedTokenExpiresAt = 0;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function normalizePincode(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 6);
}

function parseDeliveryDays(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/\d+/);
    return match ? Number(match[0]) : null;
  }
  return null;
}

function addDays(days: number | null) {
  if (!days) return null;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function parseResponseBody(text: string) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function responseMessage(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);

  if (Array.isArray(value)) {
    return value.map(responseMessage).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const direct = responseMessage(
      record.message ??
        record.error ??
        record.error_message ??
        record.status_message,
    );

    if (direct) return direct;

    return responseMessage(record.errors ?? record.data ?? record.response);
  }

  return "";
}

function positiveNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function calculatePackage(items: Record<string, any>[]) {
  return items.reduce(
    (packageInfo, item) => {
      const quantity = Math.max(1, Number(item.quantity || 1));
      const itemWeight = positiveNumber(
        item.shipping_weight_kg,
        DEFAULT_WEIGHT_KG,
      );

      return {
        breadth: Math.max(
          packageInfo.breadth,
          positiveNumber(item.package_breadth_cm, DEFAULT_BREADTH_CM),
        ),
        height: Math.max(
          packageInfo.height,
          positiveNumber(item.package_height_cm, DEFAULT_HEIGHT_CM),
        ),
        length: Math.max(
          packageInfo.length,
          positiveNumber(item.package_length_cm, DEFAULT_LENGTH_CM),
        ),
        weight: packageInfo.weight + itemWeight * quantity,
      };
    },
    {
      breadth: DEFAULT_BREADTH_CM,
      height: DEFAULT_HEIGHT_CM,
      length: DEFAULT_LENGTH_CM,
      weight: 0,
    },
  );
}

function getCredentials() {
  const email = Deno.env.get("SHIPROCKET_EMAIL");
  const password = Deno.env.get("SHIPROCKET_PASSWORD");
  const pickupPincode = Deno.env.get("SHIPROCKET_PICKUP_PINCODE");

  if (!email || !password) {
    throw new Error("Shiprocket credentials are not configured.");
  }

  return { email, password, pickupPincode };
}

async function resolvePickupPincode(warehouseId: unknown) {
  const fallback = normalizePincode(getCredentials().pickupPincode);
  const id = String(warehouseId ?? "").trim();

  if (!id) {
    console.warn("Using default Jaipur pickup PIN: product has no warehouse_id.");
    return {
      fallbackReason: "product has no warehouse_id",
      originPincode: fallback,
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      "Using default Jaipur pickup PIN: Supabase service credentials are unavailable.",
    );
    return {
      fallbackReason: "warehouse lookup is unavailable",
      originPincode: fallback,
    };
  }

  try {
    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await client
      .from("warehouses")
      .select("pickup_pincode, is_active")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      console.warn("Using default Jaipur pickup PIN: warehouse_id did not match.", {
        warehouseId: id,
      });
      return {
        fallbackReason: "warehouse_id did not match an active warehouse",
        originPincode: fallback,
      };
    }

    if (data.is_active === false) {
      console.warn("Using default Jaipur pickup PIN: warehouse is inactive.", {
        warehouseId: id,
      });
      return {
        fallbackReason: "assigned warehouse is inactive",
        originPincode: fallback,
      };
    }

    const assignedPincode = normalizePincode(
      data?.pickup_pincode,
    );
    if (assignedPincode.length === 6) {
      return { fallbackReason: null, originPincode: assignedPincode };
    }

    console.warn(
      "Using default Jaipur pickup PIN: assigned warehouse has no valid pickup_pincode.",
      { warehouseId: id },
    );
    return {
      fallbackReason: "assigned warehouse has no valid pickup_pincode",
      originPincode: fallback,
    };
  } catch (error) {
    console.warn("Shiprocket warehouse lookup failed; using default pickup PIN.", {
      message: error instanceof Error ? error.message : String(error),
      warehouseId: id,
    });
    return {
      fallbackReason: "warehouse lookup failed",
      originPincode: fallback,
    };
  }
}

async function login(forceRefresh = false) {
  if (!forceRefresh && cachedToken && Date.now() < cachedTokenExpiresAt) {
    return cachedToken;
  }

  const { email, password } = getCredentials();
  const response = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.token) {
    throw new Error(data?.message || "Shiprocket login failed.");
  }

  cachedToken = data.token;
  cachedTokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
  return cachedToken;
}

async function shiprocketRequest<T>(
  path: string,
  options: RequestInit = {},
  allowRetry = true,
): Promise<T> {
  const token = await login();
  const response = await fetch(`${SHIPROCKET_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (response.status === 401 && allowRetry) {
    cachedToken = null;
    cachedTokenExpiresAt = 0;
    await login(true);
    return shiprocketRequest<T>(path, options, false);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      responseMessage(data) ||
        "Shiprocket request could not be completed.",
    );
  }

  return data as T;
}

async function shiprocketCreateShipmentRequest<T>(
  payload: Record<string, unknown>,
  allowRetry = true,
): Promise<T> {
  const token = await login();
  const response = await fetch(`${SHIPROCKET_API_BASE}/orders/create/adhoc`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    method: "POST",
  });

  const rawBody = await response.text();
  const responseBody = parseResponseBody(rawBody);

  console.log("Shiprocket create shipment response", {
    action: "create-shipment",
    requestPayload: payload,
    responseBody,
    status: response.status,
  });

  if (response.status === 401 && allowRetry) {
    cachedToken = null;
    cachedTokenExpiresAt = 0;
    await login(true);
    return shiprocketCreateShipmentRequest<T>(payload, false);
  }

  if (!response.ok) {
    const error = new Error(
      responseMessage(responseBody) ||
        "Shiprocket request could not be completed.",
    ) as Error & {
      shiprocketResponse?: unknown;
      shiprocketStatus?: number;
    };

    error.shiprocketResponse = responseBody;
    error.shiprocketStatus = response.status;
    throw error;
  }

  return responseBody as T;
}

function chooseCourier(data: any) {
  const candidates =
    data?.data?.available_courier_companies ??
    data?.available_courier_companies ??
    [];

  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  return (
    candidates
      .filter((candidate) => candidate && typeof candidate === "object")
      .sort(
        (a, b) =>
          Number(a.rate ?? a.freight_charge ?? 0) -
          Number(b.rate ?? b.freight_charge ?? 0),
      )[0] ?? null
  );
}

function normalizeCourier(candidate: Record<string, any>) {
  const courierId =
    candidate.courier_company_id ??
    candidate.courier_id ??
    candidate.id ??
    candidate.company_id;
  const estimatedDeliveryDays = parseDeliveryDays(
    candidate.estimated_delivery_days ?? candidate.etd,
  );

  return {
    codAvailable: Boolean(candidate.cod),
    courierId,
    courierName:
      candidate.courier_name ??
      candidate.name ??
      candidate.courier_company_name ??
      "",
    estimatedDeliveryDate: addDays(estimatedDeliveryDays),
    estimatedDeliveryDays,
    freightCharge:
      candidate.freight_charge ??
      candidate.rate ??
      candidate.total_charge ??
      null,
    raw: candidate,
  };
}

function courierList(data: any) {
  const candidates =
    data?.data?.available_courier_companies ??
    data?.available_courier_companies ??
    data?.couriers ??
    [];

  if (!Array.isArray(candidates)) return [];

  return candidates
    .filter((candidate) => candidate && typeof candidate === "object")
    .map((candidate) => normalizeCourier(candidate))
    .filter((candidate) => candidate.courierId && candidate.courierName)
    .sort(
      (a, b) =>
        Number(a.freightCharge ?? 0) - Number(b.freightCharge ?? 0),
    );
}

async function serviceability(input: Record<string, unknown>) {
  const deliveryPostcode = normalizePincode(input.deliveryPincode);
  const providedOrigin = normalizePincode(input.originPincode);
  const resolution =
    providedOrigin.length === 6
      ? { fallbackReason: null, originPincode: providedOrigin }
      : await resolvePickupPincode(input.warehouseId);
  const pickupPostcode = resolution.originPincode;

  if (deliveryPostcode.length !== 6) {
    throw new Error("Enter a valid 6-digit delivery pincode.");
  }

  if (pickupPostcode.length !== 6) {
    throw new Error("Shiprocket pickup pincode is not configured.");
  }

  const params = new URLSearchParams({
    cod: input.cod ? "1" : "0",
    delivery_postcode: deliveryPostcode,
    pickup_postcode: pickupPostcode,
    weight: String(input.weight ?? DEFAULT_WEIGHT_KG),
  });
  const data = await shiprocketRequest<any>(
    `/courier/serviceability?${params.toString()}`,
  );
  const courier = chooseCourier(data);
  const estimatedDeliveryDays = parseDeliveryDays(
    courier?.estimated_delivery_days ?? courier?.etd,
  );

  return {
    codAvailable: Boolean(courier?.cod),
    courierName: courier?.courier_name ?? "",
    estimatedDeliveryDate: addDays(estimatedDeliveryDays),
    estimatedDeliveryDays,
    freightCharge: courier?.freight_charge ?? null,
    pincode: deliveryPostcode,
    rate: courier?.rate ?? courier?.freight_charge ?? null,
    serviceable: Boolean(courier),
  };
}

async function availableCouriers(input: Record<string, unknown>) {
  const shipmentId = String(input.shipmentId ?? "").trim();

  if (!shipmentId) {
    throw new Error("Shipment ID is required to fetch couriers.");
  }

  const params = new URLSearchParams({ shipment_id: shipmentId });
  const data = await shiprocketRequest<any>(
    `/courier/serviceability?${params.toString()}`,
  );

  return {
    couriers: courierList(data),
    raw: data,
  };
}

async function createShipment(body: Record<string, unknown>) {
  const order = body.order as Record<string, any>;
  const warehouse = body.warehouse as Record<string, any>;
  const items = Array.isArray(body.items)
    ? (body.items as Record<string, any>[])
    : [];

  if (!order?.order_number || !warehouse?.name || items.length === 0) {
    throw new Error("Order, warehouse, and items are required.");
  }

  const shippingAddress = (order.shipping_address || {}) as Record<string, any>;
  const orderDate = new Date(order.created_at || Date.now())
    .toISOString()
    .slice(0, 10);
  const firstItem = items[0];
  const packageInfo = calculatePackage(items);
  const shipmentGroupId = String(body.shipmentGroupId ?? "").trim();
  const shiprocketOrderReference = shipmentGroupId
    ? `${order.order_number}-${shipmentGroupId.slice(0, 8)}`
    : order.order_number;
  const payload = {
    billing_address:
      shippingAddress.addressLine1 || shippingAddress.address_line1 || "",
    billing_address_2:
      shippingAddress.addressLine2 || shippingAddress.address_line2 || "",
    billing_city: shippingAddress.city || "",
    billing_country: shippingAddress.country || "India",
    billing_customer_name: order.customer_name,
    billing_email: order.customer_email,
    billing_last_name: "",
    billing_phone: order.customer_phone,
    billing_pincode: shippingAddress.pincode || "",
    billing_state: shippingAddress.state || "",
    breadth: packageInfo.breadth,
    channel_id: "",
    comment: `Warehouse: ${warehouse.name}`,
    company_name: "House of Patani",
    customer_gstin: "",
    giftwrap_charges: 0,
    height: packageInfo.height,
    length: packageInfo.length,
    order_date: orderDate,
    order_id: shiprocketOrderReference,
    order_items: items.map((item) => ({
      name: item.product_name,
      selling_price: item.price,
      sku: item.product_id || item.id,
      units: item.quantity,
    })),
    order_type: "ESSENTIALS",
    payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
    pickup_location:
      warehouse.shiprocket_pickup_location || warehouse.name,
    reseller_name: "",
    shipping_charges: order.shipping,
    shipping_is_billing: true,
    sku: firstItem?.product_id || firstItem?.id || order.order_number,
    sub_total: order.subtotal,
    total_discount: order.discount,
    transaction_charges: 0,
    weight: Math.max(DEFAULT_WEIGHT_KG, packageInfo.weight),
  };

  return shiprocketCreateShipmentRequest(payload);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ message: "Method not allowed.", ok: false }, 405);
  }

  let action = "";

  try {
    const body = await request.json();
    action = String(body?.action ?? "");

    if (action === "login") {
      await login(true);
      return json({ ok: true });
    }

    if (
      action === "serviceability" ||
      action === "rate" ||
      action === "delivery-days"
    ) {
      return json(await serviceability(body.input ?? {}));
    }

    if (action === "warehouse-origin") {
      return json(
        await resolvePickupPincode((body.input ?? {}).warehouseId),
      );
    }

    if (action === "create-shipment") {
      return json(await createShipment(body));
    }

    if (action === "available-couriers") {
      return json(await availableCouriers(body.input ?? body));
    }

    if (action === "generate-awb") {
      return json(
        await shiprocketRequest("/courier/assign/awb", {
          body: JSON.stringify({
            courier_id: body.courierId,
            shipment_id: body.shipmentId,
          }),
          method: "POST",
        }),
      );
    }

    if (action === "track") {
      const awbNumber = String(body.awbNumber ?? "").trim();
      if (!awbNumber) throw new Error("AWB number is required.");
      return json(
        await shiprocketRequest(
          `/courier/track/awb/${encodeURIComponent(awbNumber)}`,
        ),
      );
    }

    return json({ message: "Unknown Shiprocket action.", ok: false }, 400);
  } catch (error) {
    const details = error as Error & {
      shiprocketResponse?: unknown;
      shiprocketStatus?: number;
    };

    return json(
      {
        action,
        message:
          error instanceof Error
            ? error.message
            : "Shiprocket request could not be completed.",
        ok: false,
        shiprocketResponse: details.shiprocketResponse,
        shiprocketStatus: details.shiprocketStatus,
      },
    );
  }
});
