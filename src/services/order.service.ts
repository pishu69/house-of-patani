import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { fallbackAfterError } from "@/services/service.utils";
import type { OrderRow } from "@/types/database.types";

export const orderService = {
  async list(): Promise<ServiceResponse<OrderRow[]>> {
    if (!supabase) {
      return mockResponse([]);
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
        [],
        error,
        "We could not load orders right now.",
      );
    }
  },
};
