import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { fallbackAfterError } from "@/services/service.utils";
import type { WishlistRow } from "@/types/database.types";

export const wishlistService = {
  async listByCustomer(
    customerId: string,
  ): Promise<ServiceResponse<WishlistRow[]>> {
    if (!supabase) {
      return mockResponse([]);
    }

    try {
      const { data, error } = await supabase
        .from("wishlists")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return supabaseResponse(data ?? []);
    } catch (error) {
      return fallbackAfterError(
        [],
        error,
        "We could not load the wishlist right now.",
      );
    }
  },
};
