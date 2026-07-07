import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { adminStorage } from "@/services/admin-storage";
import { fallbackAfterError } from "@/services/service.utils";
import type { WarehouseRow } from "@/types/database.types";

export type WarehouseInput = Pick<
  WarehouseRow,
  | "active"
  | "address_line_1"
  | "address_line_2"
  | "city"
  | "contact_person"
  | "country"
  | "email"
  | "gst_number"
  | "name"
  | "phone"
  | "pincode"
  | "state"
>;

export const warehouseService = {
  async list(): Promise<ServiceResponse<WarehouseRow[]>> {
    if (!supabase) {
      return mockResponse(adminStorage.warehouses.list());
    }

    try {
      const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return supabaseResponse(data ?? []);
    } catch (error) {
      return fallbackAfterError(
        adminStorage.warehouses.list(),
        error,
        "We could not load warehouses right now.",
      );
    }
  },

  async create(input: WarehouseInput): Promise<ServiceResponse<WarehouseRow>> {
    const localFallback = () => adminStorage.warehouses.create(input);

    if (!supabase) {
      return mockResponse(localFallback());
    }

    try {
      const { data, error } = await supabase
        .from("warehouses")
        .insert(input)
        .select("*")
        .single();

      if (error) throw error;

      return supabaseResponse(data);
    } catch (error) {
      return fallbackAfterError(
        localFallback(),
        error,
        "The warehouse could not be saved to the database, so it was kept locally.",
      );
    }
  },

  async update(
    id: string,
    input: Partial<WarehouseInput>,
  ): Promise<ServiceResponse<WarehouseRow | null>> {
    const localFallback = () => adminStorage.warehouses.update(id, input);

    if (!supabase) {
      return mockResponse(localFallback());
    }

    try {
      const { data, error } = await supabase
        .from("warehouses")
        .update(input)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      return supabaseResponse(data);
    } catch (error) {
      return fallbackAfterError(
        localFallback(),
        error,
        "The warehouse could not be updated in the database, so the change was kept locally.",
      );
    }
  },

  async remove(id: string): Promise<ServiceResponse<boolean>> {
    const localFallback = () => adminStorage.warehouses.remove(id);

    if (!supabase) {
      return mockResponse(localFallback());
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

      const { error } = await supabase.from("warehouses").delete().eq("id", id);

      if (error) throw error;

      return supabaseResponse(true);
    } catch (error) {
      if (error instanceof Error) throw error;

      return fallbackAfterError(
        localFallback(),
        error,
        "The warehouse could not be deleted from the database, so it was removed locally.",
      );
    }
  },
};
