import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { mockAdminOrders } from "@/data/admin";
import { supabase } from "@/lib/supabase";
import { adminStorage } from "@/services/admin-storage";
import { fallbackAfterError } from "@/services/service.utils";
import type { OrderRow } from "@/types/database.types";

export const orderService = {
  async list(): Promise<ServiceResponse<OrderRow[]>> {
    if (!supabase) {
      return mockResponse(adminStorage.orders.list());
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return supabaseResponse(data ?? []);
    } catch (error) {
      return fallbackAfterError(
        adminStorage.orders.list(),
        error,
        "We could not load orders right now.",
      );
    }
  },

  async update(
    id: string,
    input: Pick<
      Partial<OrderRow>,
      "order_status" | "payment_method" | "payment_status"
    >,
  ): Promise<ServiceResponse<OrderRow | null>> {
    const localFallback = () => adminStorage.orders.update(id, input);

    if (!supabase) {
      return mockResponse(localFallback());
    }

    try {
      const { data, error } = await supabase
        .from("orders")
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
        "The order could not be updated in the database, so the change was kept locally.",
      );
    }
  },
};
