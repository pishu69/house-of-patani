import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { mockAdminCustomers } from "@/data/admin";
import { supabase } from "@/lib/supabase";
import { fallbackAfterError } from "@/services/service.utils";
import type { CustomerRow } from "@/types/database.types";

export const customerService = {
  async list(): Promise<ServiceResponse<CustomerRow[]>> {
    if (!supabase) {
      return mockResponse(mockAdminCustomers);
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
        mockAdminCustomers,
        error,
        "We could not load customers right now.",
      );
    }
  },
};
