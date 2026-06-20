import type { CreateGuestOrderInput } from "@/types/order.types";

export interface PaymentIntent {
  amount: number;
  currency: "INR";
  id: string;
  razorpayOrderId: string;
  receipt: string;
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error: {
    code?: string;
    description?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
    reason?: string;
    source?: string;
    step?: string;
  };
}

export interface RazorpayCheckoutOptions {
  amount: number;
  currency: "INR";
  description: string;
  handler: (response: RazorpaySuccessResponse) => void;
  image?: string;
  key: string;
  modal: {
    confirm_close: boolean;
    ondismiss: () => void;
  };
  name: string;
  notes: {
    intent_id: string;
    receipt: string;
  };
  order_id: string;
  prefill: {
    contact: string;
    email: string;
    name: string;
  };
  readonly: {
    contact: boolean;
    email: boolean;
    name: boolean;
  };
  retry: {
    enabled: boolean;
  };
  theme: {
    color: string;
  };
}

export interface RazorpayInstance {
  close: () => void;
  on: (
    event: "payment.failed",
    handler: (response: RazorpayFailureResponse) => void,
  ) => void;
  open: () => void;
}

export interface RazorpayConstructor {
  new (options: RazorpayCheckoutOptions): RazorpayInstance;
}

export interface CreatePaymentIntentInput {
  checkout: CreateGuestOrderInput;
}
