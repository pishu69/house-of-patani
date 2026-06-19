import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { fallbackAfterError } from "@/services/service.utils";
import type { CustomerRow } from "@/types/database.types";

export const customerService = {
  async list(): Promise<ServiceResponse<CustomerRow[]>> {
    if (!supabase) {
      return mockResponse([]);
    }

    try {
      const { data, error } = await supabase
        .from("customers")
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
        "We could not load customers right now.",
      );
    }
  },
};
