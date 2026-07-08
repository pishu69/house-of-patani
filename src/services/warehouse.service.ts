import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { adminStorage } from "@/services/admin-storage";
import type { WarehouseRow } from "@/types/database.types";

export interface WarehouseInput {
  is_active: boolean;
  name: string;
  pickup_pincode: string;
  shiprocket_pickup_location: string;
}

function normalizeWarehouse(row: WarehouseRow): WarehouseRow {
  return {
    ...row,
    is_active: row.is_active ?? true,
    pickup_pincode: row.pickup_pincode || null,
    shiprocket_pickup_location:
      row.shiprocket_pickup_location || row.name,
  };
}

function warehouseInsert(input: WarehouseInput) {
  return {
    is_active: input.is_active,
    name: input.name,
    pickup_pincode: input.pickup_pincode,
    shiprocket_pickup_location: input.shiprocket_pickup_location,
  };
}

function logWarehouseError(
  operation: "create" | "delete" | "list" | "update",
  error: unknown,
) {
  const value =
    error && typeof error === "object"
      ? (error as Record<string, unknown>)
      : {};

  console.error(`Supabase warehouse ${operation} failed.`, {
    code: value.code ?? null,
    details: value.details ?? null,
    hint: value.hint ?? null,
    message:
      value.message ??
      (error instanceof Error ? error.message : String(error)),
  });
}

function toWarehouseError(error: unknown) {
  if (error instanceof Error) return error;

  if (error && typeof error === "object") {
    const value = error as Record<string, unknown>;
    const message =
      typeof value.message === "string" && value.message.trim()
        ? value.message.trim()
        : "The warehouse request failed.";
    const details =
      typeof value.details === "string" && value.details.trim()
        ? ` ${value.details.trim()}`
        : "";
    const hint =
      typeof value.hint === "string" && value.hint.trim()
        ? ` Hint: ${value.hint.trim()}`
        : "";
    const code =
      typeof value.code === "string" && value.code.trim()
        ? ` (${value.code.trim()})`
        : "";

    return new Error(`${message}${code}.${details}${hint}`.trim());
  }

  return new Error("The warehouse request failed.");
}

export const warehouseService = {
  async list(): Promise<ServiceResponse<WarehouseRow[]>> {
    if (!supabase) {
      return mockResponse(adminStorage.warehouses.list().map(normalizeWarehouse));
    }

    try {
      const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return supabaseResponse((data ?? []).map(normalizeWarehouse));
    } catch (error) {
      logWarehouseError("list", error);
      throw toWarehouseError(error);
    }
  },

  async create(input: WarehouseInput): Promise<ServiceResponse<WarehouseRow>> {
    if (!supabase) {
      return mockResponse(
        normalizeWarehouse(
          adminStorage.warehouses.create(warehouseInsert(input)),
        ),
      );
    }

    try {
      const { data, error } = await supabase
        .from("warehouses")
        .insert(warehouseInsert(input))
        .select("*")
        .single();

      if (error) throw error;

      return supabaseResponse(normalizeWarehouse(data));
    } catch (error) {
      logWarehouseError("create", error);
      throw toWarehouseError(error);
    }
  },

  async update(
    id: string,
    input: Partial<WarehouseInput>,
  ): Promise<ServiceResponse<WarehouseRow | null>> {
    if (!supabase) {
      return mockResponse(adminStorage.warehouses.update(id, input));
    }

    try {
      const { data, error } = await supabase
        .from("warehouses")
        .update(input)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      return supabaseResponse(normalizeWarehouse(data));
    } catch (error) {
      logWarehouseError("update", error);
      throw toWarehouseError(error);
    }
  },

  async remove(id: string): Promise<ServiceResponse<boolean>> {
    if (!supabase) {
      return mockResponse(adminStorage.warehouses.remove(id));
    }

    try {
      const { count, error: referenceError } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("warehouse_id", id);

      if (referenceError) throw referenceError;

      if ((count ?? 0) > 0) {
        throw new Error("This warehouse is assigned to an order.");
      }

      const { count: productCount, error: productReferenceError } =
        await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("warehouse_id", id);

      if (productReferenceError) throw productReferenceError;

      if ((productCount ?? 0) > 0) {
        throw new Error("This warehouse is assigned to a product.");
      }

      const { data, error } = await supabase
        .from("warehouses")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Warehouse not found or already deleted.");

      return supabaseResponse(true);
    } catch (error) {
      logWarehouseError("delete", error);
      throw toWarehouseError(error);
    }
  },
};
