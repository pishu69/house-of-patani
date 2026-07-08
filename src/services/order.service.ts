import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { mockAdminOrders } from "@/data/admin";
import { supabase } from "@/lib/supabase";
import { adminStorage } from "@/services/admin-storage";
import { fallbackAfterError } from "@/services/service.utils";
import { productService } from "@/services/product.service";
import { settingService } from "@/services/setting.service";
import type {
  Json,
  OrderItemRow,
  OrderRow,
} from "@/types/database.types";
import type {
  CreateGuestOrderInput,
  OrderConfirmation,
  RazorpayPaymentReference,
} from "@/types/order.types";

function isOrderRow(value: unknown): value is OrderRow {
  return (
    typeof value === "object" &&
    value !== null &&
    "order_number" in value &&
    typeof value.order_number === "string"
  );
}

function isOrderItemRow(value: unknown): value is OrderItemRow {
  return (
    typeof value === "object" &&
    value !== null &&
    "product_name" in value &&
    typeof value.product_name === "string"
  );
}

function parseConfirmation(value: Json): OrderConfirmation {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !isOrderRow(value.order) ||
    !Array.isArray(value.items)
  ) {
    throw new Error("INVALID_ORDER_RESPONSE");
  }

  const items = value.items.flatMap<OrderItemRow>((item) =>
    isOrderItemRow(item) ? [item] : [],
  );
  if (items.length !== value.items.length) {
    throw new Error("INVALID_ORDER_RESPONSE");
  }

  return { items, order: value.order };
}

const ORDER_SELECT = [
  "confirmation_email_sent_at",
  "awb_number",
  "courier_name",
  "courier_partner",
  "created_at",
  "customer_email",
  "customer_id",
  "customer_name",
  "customer_phone",
  "delivered_at",
  "discount",
  "dispatched_at",
  "estimated_delivery_at",
  "estimated_delivery_date",
  "id",
  "notes",
  "order_number",
  "order_status",
  "paid_at",
  "payment_method",
  "payment_status",
  "razorpay_order_id",
  "razorpay_payment_id",
  "razorpay_signature",
  "shipping",
  "shipping_address",
  "shiprocket_order_id",
  "shipment_id",
  "shipment_status",
  "subtotal",
  "total",
  "tracking_number",
  "tracking_url",
  "updated_at",
  "warehouse_id",
].join(", ");

async function sendOrderConfirmationEmail(orderId: string) {
  if (!supabase) return;

  try {
    const { error } = await supabase.functions.invoke("send-order-email", {
      body: { orderId },
    });

    if (error) {
      console.warn("Order confirmation email could not be sent.", error);
    }
  } catch (error) {
    console.warn("Order confirmation email could not be sent.", error);
  }
}

export const orderService = {
  async list(): Promise<ServiceResponse<OrderRow[]>> {
    if (!supabase) {
      return mockResponse(adminStorage.orders.list());
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(ORDER_SELECT)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return supabaseResponse((data ?? []) as unknown as OrderRow[]);
    } catch (error) {
      return fallbackAfterError(
        adminStorage.orders.list(),
        error,
        "We could not load orders right now.",
      );
    }
  },

  async update(
    id: string,
    input: Pick<
  Partial<OrderRow>,
  | "order_status"
  | "payment_method"
  | "payment_status"
  | "courier_partner"
  | "courier_name"
  | "tracking_number"
  | "tracking_url"
  | "awb_number"
  | "shiprocket_order_id"
  | "shipment_id"
  | "shipment_status"
  | "dispatched_at"
  | "estimated_delivery_at"
  | "estimated_delivery_date"
  | "delivered_at"
  | "warehouse_id"
>,
  ): Promise<ServiceResponse<OrderRow | null>> {
    const localFallback = () => adminStorage.orders.update(id, input);

    if (!supabase) {
      return mockResponse(localFallback());
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .update(input)
        .eq("id", id)
        .select(ORDER_SELECT)
        .single();

      if (error) throw error;
      return supabaseResponse(data as unknown as OrderRow);
    } catch (error) {
      return fallbackAfterError(
        localFallback(),
        error,
        "The order could not be updated in the database, so the change was kept locally.",
      );
    }
  },

  async createGuestOrder(
    input: CreateGuestOrderInput,
  ): Promise<ServiceResponse<OrderConfirmation>> {
    const catalogResponse = await productService.listAdmin();
    const settingsResponse = await settingService.get();
    const catalog = catalogResponse.data;
    const orderProducts = input.items.map((item) => {
      const product = catalog.find(
        (catalogProduct) =>
          catalogProduct.id === item.productId ||
          catalogProduct.sku === item.sku,
      );
      if (!product || !product.active || product.stock < item.quantity) {
        throw new Error("One or more products are unavailable.");
      }
      return { product, quantity: item.quantity };
    });
    const subtotal = orderProducts.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
    const shipping =
      subtotal >= settingsResponse.data.freeShippingThreshold
        ? 0
        : settingsResponse.data.shippingCharge;
    const verifiedInput: CreateGuestOrderInput = {
      ...input,
      discount: Math.min(input.discount, subtotal),
      shipping,
      subtotal,
      total: subtotal - Math.min(input.discount, subtotal) + shipping,
    };
    const localFallback = () =>
      adminStorage.orders.create(verifiedInput, catalog, shipping);

    if (input.paymentMethod !== "cod") {
      throw new Error("Online payment must be verified before order creation.");
    }

    if (!settingsResponse.data.codEnabled) {
      throw new Error("Cash on Delivery is not available right now.");
    }

    if (!supabase) return mockResponse(localFallback());

    try {
      const address: Json = {
        addressLine1: verifiedInput.address.addressLine1,
        addressLine2: verifiedInput.address.addressLine2,
        city: verifiedInput.address.city,
        country: verifiedInput.address.country,
        landmark: verifiedInput.address.landmark,
        pincode: verifiedInput.address.pincode,
        state: verifiedInput.address.state,
      };
      const items: Json = verifiedInput.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        sku: item.sku,
      }));
      const { data, error } = await supabase.rpc("create_guest_order", {
        p_address: address,
        p_customer_email: verifiedInput.customerEmail,
        p_customer_name: verifiedInput.customerName,
        p_customer_phone: verifiedInput.customerPhone,
        p_items: items,
        p_payment_method: verifiedInput.paymentMethod,
      });
      if (error) throw error;
      const confirmation = parseConfirmation(data);

const { error: inventoryError } = await supabase.rpc(
  "deduct_inventory_for_order",
  {
    p_order_id: confirmation.order.id,
  },
);

if (inventoryError) throw inventoryError;

      adminStorage.orders.saveConfirmation(confirmation);
      await sendOrderConfirmationEmail(confirmation.order.id);
      return supabaseResponse(confirmation);
    } catch (error) {
      return fallbackAfterError(
        localFallback(),
        error,
        "The order could not reach the database, so it was saved safely on this device.",
      );
    }
  },

  async createPaidGuestOrder(
    input: CreateGuestOrderInput,
    paymentReference: RazorpayPaymentReference,
  ): Promise<ServiceResponse<OrderConfirmation>> {
    const catalogResponse = await productService.listAdmin();
    const settingsResponse = await settingService.get();
    const catalog = catalogResponse.data;
    const subtotal = input.items.reduce((total, item) => {
      const product = catalog.find(
        (candidate) =>
          candidate.id === item.productId || candidate.sku === item.sku,
      );
      if (!product || !product.active || product.stock < item.quantity) {
        throw new Error("One or more products are unavailable.");
      }
      return total + product.price * item.quantity;
    }, 0);
    const shipping =
      subtotal >= settingsResponse.data.freeShippingThreshold
        ? 0
        : settingsResponse.data.shippingCharge;
    const discount = Math.min(input.discount, subtotal);

const verifiedInput: CreateGuestOrderInput = {
  ...input,
  discount,
  paymentMethod: "razorpay",
  shipping,
  subtotal,
  total: subtotal - discount + shipping,
};

    return mockResponse(
      adminStorage.orders.create(
        verifiedInput,
        catalog,
        shipping,
        paymentReference,
      ),
    );
  },

  async getByOrderNumber(
    orderNumber: string,
  ): Promise<ServiceResponse<OrderConfirmation | null>> {
    const fallback = adminStorage.orders.getConfirmation(orderNumber);

if (!supabase) {
  return mockResponse(fallback);
}

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(ORDER_SELECT)
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (orderError) throw orderError;
      const orderRow = order as OrderRow | null;
      if (!orderRow) return mockResponse(fallback);

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderRow.id);
      if (itemsError) throw itemsError;
      return supabaseResponse({ items: items ?? [], order: orderRow });
    } catch (error) {
      return fallbackAfterError(
        fallback,
        error,
        "We could not refresh this order confirmation right now.",
      );
    }
  },

  sendOrderConfirmationEmail,
};
