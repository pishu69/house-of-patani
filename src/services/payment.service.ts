import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { orderService } from "@/services/order.service";
import type { OrderConfirmation } from "@/types/order.types";
import type {
  CreatePaymentIntentInput,
  PaymentIntent,
  RazorpayCheckoutOptions,
  RazorpayFailureResponse,
  RazorpaySuccessResponse,
} from "@/types/payment.types";

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_SCRIPT_ID = "razorpay-checkout-script";
const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID?.trim() ?? "";
let scriptPromise: Promise<boolean> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePaymentIntent(value: unknown): PaymentIntent {
  if (
    !isRecord(value) ||
    typeof value.amount !== "number" ||
    value.currency !== "INR" ||
    typeof value.id !== "string" ||
    typeof value.razorpayOrderId !== "string" ||
    typeof value.receipt !== "string"
  ) {
    throw new Error("The payment session returned an invalid response.");
  }

  return {
    amount: value.amount,
    currency: "INR",
    id: value.id,
    razorpayOrderId: value.razorpayOrderId,
    receipt: value.receipt,
  };
}

function isOrderConfirmation(value: unknown): value is OrderConfirmation {
  return (
    isRecord(value) &&
    isRecord(value.order) &&
    typeof value.order.order_number === "string" &&
    Array.isArray(value.items)
  );
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `+91${digits}` : `+${digits}`;
}

export function isRazorpayConfigured() {
  return Boolean(razorpayKeyId);
}

export function isRazorpayBackendAvailable() {
  return Boolean(supabase);
}

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    const existing = document.getElementById(
      RAZORPAY_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), {
        once: true,
      });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
): Promise<ServiceResponse<PaymentIntent>> {
  if (!supabase) {
    const id = `local-intent-${Date.now()}`;
    return mockResponse({
      amount: Math.round(input.checkout.total * 100),
      currency: "INR",
      id,
      razorpayOrderId: `local-order-${Date.now()}`,
      receipt: id.slice(0, 40),
    });
  }

  const { checkout } = input;
  const { data, error } = await supabase.functions.invoke(
    "create-razorpay-order",
    {
      body: {
  address: checkout.address,
  customerEmail: checkout.customerEmail,
  customerName: checkout.customerName,
  customerPhone: checkout.customerPhone,
  discount: checkout.discount,
  items: checkout.items.map((item) => ({
    quantity: item.quantity,
    sku: item.sku,
  })),
  shipping: checkout.shipping,
  subtotal: checkout.subtotal,
  total: checkout.total,
},
    },
  );

  if (error) {
    throw new Error("Online payment could not be prepared. Please use COD.");
  }

  return supabaseResponse(parsePaymentIntent(data));
}

export function createRazorpayOptions({
  checkout,
  intent,
  logoUrl,
  onDismiss,
  onSuccess,
  storeName,
}: {
  checkout: CreatePaymentIntentInput["checkout"];
  intent: PaymentIntent;
  logoUrl?: string | undefined;
  onDismiss: () => void;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  storeName: string;
}): RazorpayCheckoutOptions {
  if (!razorpayKeyId) {
    throw new Error("Online payment is not configured.");
  }

  return {
    amount: intent.amount,
    currency: intent.currency,
    description: `Order ${intent.receipt}`,
    handler: onSuccess,
    ...(logoUrl ? { image: logoUrl } : {}),
    key: razorpayKeyId,
    modal: {
      confirm_close: true,
      ondismiss: onDismiss,
    },
    name: storeName,
    notes: {
      intent_id: intent.id,
      receipt: intent.receipt,
    },
    order_id: intent.razorpayOrderId,
    prefill: {
      contact: normalizePhone(checkout.customerPhone),
      email: checkout.customerEmail,
      name: checkout.customerName,
    },
    readonly: {
      contact: true,
      email: true,
      name: true,
    },
    retry: {
      enabled: true,
    },
    theme: {
      color: "#5f1e2d",
    },
  };
}

export async function handleRazorpaySuccess({
  checkout,
  intent,
  response,
}: {
  checkout: CreatePaymentIntentInput["checkout"];
  intent: PaymentIntent;
  response: RazorpaySuccessResponse;
}): Promise<ServiceResponse<OrderConfirmation>> {
  if (!supabase) {
    return orderService.createPaidGuestOrder(checkout, {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
    });
  }

  const { data, error } = await supabase.functions.invoke(
    "verify-razorpay-payment",
    {
      body: {
        intentId: intent.id,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      },
    },
  );

  if (error || !isOrderConfirmation(data)) {
    throw new Error(
      "Payment was received but verification is still pending. Please contact support before retrying.",
    );
  }

  return supabaseResponse(data);
}

export function handleRazorpayFailure(response?: RazorpayFailureResponse) {
  return (
    response?.error.description ??
    "Payment was not completed. Your cart has been kept unchanged."
  );
}

export const paymentService = {
  createPaymentIntent,
  createRazorpayOptions,
  handleRazorpayFailure,
  handleRazorpaySuccess,
  isRazorpayBackendAvailable,
  isRazorpayConfigured,
  loadRazorpayScript,
};
