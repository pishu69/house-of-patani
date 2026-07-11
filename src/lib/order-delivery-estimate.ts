export interface CustomerDeliveryEstimate {
  earliestDeliveryDate: string | null;
  isMultiWarehouse: boolean;
  latestDeliveryDate: string | null;
}

const key = (orderNumber: string) => `hop_order_delivery_estimate_${orderNumber}`;

export const orderDeliveryEstimateStorage = {
  get(orderNumber: string): CustomerDeliveryEstimate | null {
    try {
      const value = window.localStorage.getItem(key(orderNumber));
      return value ? (JSON.parse(value) as CustomerDeliveryEstimate) : null;
    } catch { return null; }
  },
  set(orderNumber: string, estimate: CustomerDeliveryEstimate) {
    try { window.localStorage.setItem(key(orderNumber), JSON.stringify(estimate)); } catch { /* Use stored order dates as fallback. */ }
  },
};
