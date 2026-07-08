import type { OrderItemRow, OrderRow, WarehouseRow } from "@/types/database.types";
import type { CatalogProduct } from "@/types/product.types";
import { supabase } from "@/lib/supabase";

const ESTIMATE_STORAGE_KEY = "hop_shiprocket_delivery_estimate";

export interface ShiprocketServiceabilityInput {
  cod?: boolean;
  deliveryPincode: string;
  originPincode?: string | null;
  warehouseId?: string | null;
  weight?: number;
}

export interface WarehouseOriginResolution {
  fallbackReason: string | null;
  originPincode: string;
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

export interface CartDeliveryEstimate {
  codAvailable: boolean;
  earliestDeliveryDate: string | null;
  estimates: ShiprocketDeliveryEstimate[];
  isMultiWarehouse: boolean;
  latestDeliveryDate: string | null;
  serviceable: boolean;
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

  async resolveWarehouseOrigin(warehouseId: string) {
    return invokeShiprocket<WarehouseOriginResolution>("warehouse-origin", {
      input: { warehouseId },
    });
  },

  async checkServiceability(input: ShiprocketServiceabilityInput) {
    const estimate = await invokeShiprocket<ShiprocketDeliveryEstimate>(
      "serviceability",
      { input },
    );
    shiprocketEstimateStorage.set(estimate);
    return estimate;
  },

  async checkCartServiceability({
    cod,
    deliveryPincode,
    products,
  }: {
    cod: boolean;
    deliveryPincode: string;
    products: CatalogProduct[];
  }): Promise<CartDeliveryEstimate> {
    const groups = new Map<string, CatalogProduct>();

    for (const product of products) {
      const key = product.warehouseId || "__default-jaipur";
      if (!groups.has(key)) groups.set(key, product);
    }

    const estimates = await Promise.all(
      [...groups.entries()].map(async ([groupKey, product]) => {
        const warehouseId = product.warehouseId;
        const resolution = await shiprocketService.resolveWarehouseOrigin(
          warehouseId ?? "",
        );

        if (resolution.fallbackReason) {
          console.warn("Cart delivery estimate is using the Jaipur fallback.", {
            productId: product.id,
            reason: resolution.fallbackReason,
            warehouse_id: warehouseId,
          });
        } else {
          console.debug("Cart delivery origin resolved.", {
            group: groupKey,
            origin_pincode: resolution.originPincode,
            warehouse_id: warehouseId,
          });
        }

        return shiprocketService.checkServiceability({
          cod,
          deliveryPincode,
          originPincode: resolution.originPincode,
          warehouseId,
        });
      }),
    );
    const dates = estimates
      .map((estimate) => estimate.estimatedDeliveryDate)
      .filter((value): value is string => Boolean(value))
      .sort();

    return {
      codAvailable: estimates.every((estimate) => estimate.codAvailable),
      earliestDeliveryDate: dates[0] ?? null,
      estimates,
      isMultiWarehouse: groups.size > 1,
      latestDeliveryDate: dates[dates.length - 1] ?? null,
      serviceable: estimates.every((estimate) => estimate.serviceable),
    };
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
    shipmentGroupId,
    warehouse,
  }: {
    items: OrderItemRow[];
    order: OrderRow;
    shipmentGroupId?: string;
    warehouse: WarehouseRow;
  }) {
    return invokeShiprocket<any>("create-shipment", {
      items,
      order,
      shipmentGroupId,
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
