import type { OrderStatus } from "@/constants/order-status";
import type { PaymentStatus } from "@/constants/payment-status";
import type { Address } from "@/types/address.types";
import type {
  OrderItemRow,
  OrderRow,
} from "@/types/database.types";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress?: Address;
  createdAt: string;
}

export interface CheckoutAddress {
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  landmark: string;
  pincode: string;
  state: string;
}

export interface CheckoutOrderItem {
  productId: string;
  quantity: number;
  sku: string;
}

export interface CreateGuestOrderInput {
  address: CheckoutAddress;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  discount: number;
  items: CheckoutOrderItem[];
  paymentMethod: "cod" | "razorpay";
  shipping: number;
  subtotal: number;
  total: number;
}

export interface OrderConfirmation {
  items: OrderItemRow[];
  order: OrderRow;
}
