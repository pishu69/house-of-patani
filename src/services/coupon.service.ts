import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { mockAdminCoupons } from "@/data/admin";
import { supabase } from "@/lib/supabase";
import { fallbackAfterError } from "@/services/service.utils";
import type { CouponRow } from "@/types/database.types";

export const couponService = {
  async list(): Promise<ServiceResponse<CouponRow[]>> {
    if (!supabase) {
      return mockResponse(mockAdminCoupons);
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
        mockAdminCoupons,
        error,
        "We could not load coupons right now.",
      );
    }
  },
};
