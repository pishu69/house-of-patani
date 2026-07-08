import type { OrderItemRow, OrderRow, WarehouseRow } from "@/types/database.types";
import { supabase } from "@/lib/supabase";

const ESTIMATE_STORAGE_KEY = "hop_shiprocket_delivery_estimate";

export interface ShiprocketServiceabilityInput {
  cod?: boolean;
  deliveryPincode: string;
  weight?: number;
}

export interface ShiprocketDeliveryEstimate {
  codAvailable: boolean;
  courierName: string;
  estimatedDeliveryDate: string | null;
  estimatedDeliveryDays: number | null;
  freightCharge: number | null;
  pincode: string;
  rate: number | null;
  serviceable: boolean;
}

export interface ShiprocketCourierOption {
  codAvailable: boolean;
  courierId: number | string;
  courierName: string;
  estimatedDeliveryDate: string | null;
  estimatedDeliveryDays: number | null;
  freightCharge: number | null;
}

async function invokeShiprocket<T>(action: string, payload: Record<string, unknown>) {
  if (!supabase) {
    throw new Error("Shiprocket is not configured.");
  }

  const { data, error } = await supabase.functions.invoke("shiprocket", {
    body: { action, ...payload },
  });

  if (error) throw new Error(error.message || "Shiprocket request failed.");
  if (data?.message && data?.ok === false) throw new Error(data.message);

  return data as T;
}

export const shiprocketEstimateStorage = {
  get(): ShiprocketDeliveryEstimate | null {
    try {
      const raw = window.localStorage.getItem(ESTIMATE_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ShiprocketDeliveryEstimate) : null;
    } catch {
      return null;
    }
  },
  set(estimate: ShiprocketDeliveryEstimate) {
    window.localStorage.setItem(ESTIMATE_STORAGE_KEY, JSON.stringify(estimate));
  },
};

export const shiprocketService = {
  isConfigured() {
    return Boolean(supabase);
  },

  async login() {
    return invokeShiprocket<{ ok: true }>("login", {});
  },

  async checkServiceability(input: ShiprocketServiceabilityInput) {
    const estimate = await invokeShiprocket<ShiprocketDeliveryEstimate>(
      "serviceability",
      { input },
    );
    shiprocketEstimateStorage.set(estimate);
    return estimate;
  },

  async calculateShippingRate(input: ShiprocketServiceabilityInput) {
    const estimate = await invokeShiprocket<ShiprocketDeliveryEstimate>("rate", {
      input,
    });
    shiprocketEstimateStorage.set(estimate);
    return estimate.rate;
  },

  async getEstimatedDeliveryDays(input: ShiprocketServiceabilityInput) {
    const estimate = await invokeShiprocket<ShiprocketDeliveryEstimate>(
      "delivery-days",
      { input },
    );
    shiprocketEstimateStorage.set(estimate);
    return estimate.estimatedDeliveryDays;
  },

  async createShipment({
    items,
    order,
    warehouse,
  }: {
    items: OrderItemRow[];
    order: OrderRow;
    warehouse: WarehouseRow;
  }) {
    return invokeShiprocket<any>("create-shipment", {
      items,
      order,
      warehouse,
    });
  },

  async listCouriers(shipmentId: string) {
    return invokeShiprocket<{ couriers: ShiprocketCourierOption[] }>(
      "available-couriers",
      {
        input: { shipmentId },
      },
    );
  },

  async generateAwb(shipmentId: string, courierId?: number) {
    return invokeShiprocket<any>("generate-awb", { courierId, shipmentId });
  },

  async trackShipment(awbNumber: string) {
    return invokeShiprocket<any>("track", { awbNumber });
  },
};
