import type { RazorpayConstructor } from "@/types/payment.types";

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export {};
