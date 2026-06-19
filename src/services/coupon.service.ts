import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { fallbackAfterError } from "@/services/service.utils";
import type { CouponRow } from "@/types/database.types";

export const couponService = {
  async list(): Promise<ServiceResponse<CouponRow[]>> {
    if (!supabase) {
      return mockResponse([]);
    }

    try {
      const { data, error } = await supabase
        .from("coupons")
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
        "We could not load coupons right now.",
      );
    }
  },
};
