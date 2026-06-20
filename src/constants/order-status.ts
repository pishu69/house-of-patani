export const ORDER_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PACKED: "packed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

export type OrderStatus =
  (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];
