import type { OrderStatus } from "@/constants/order-status";
import type { PaymentStatus } from "@/constants/payment-status";
import type { Address } from "@/types/address.types";

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
