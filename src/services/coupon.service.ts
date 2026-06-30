import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { adminStorage } from "@/services/admin-storage";
import { fallbackAfterError } from "@/services/service.utils";
import type { CouponInput } from "@/types/admin.types";
import type { CouponRow } from "@/types/database.types";

export const couponService = {
  async validate(code: string): Promise<ServiceResponse<CouponRow | null>> {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      return mockResponse(null);
    }

    if (!supabase) {
      const coupon =
        adminStorage.coupons
          .list()
          .find(
            (item) => item.code.trim().toUpperCase() === normalizedCode,
          ) ?? null;

      return mockResponse(coupon);
    }

    try {
      const { data, error } = await supabase.rpc("validate_coupon", {
        p_code: normalizedCode,
      });

      if (error) throw error;

      return supabaseResponse(data ?? null);
    } catch (error) {
      return fallbackAfterError(
        null,
        error,
        "Coupon could not be validated right now.",
      );
    }
  },

  async list(): Promise<ServiceResponse<CouponRow[]>> {
    if (!supabase) {
      return mockResponse(adminStorage.coupons.list());
    }

    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return supabaseResponse(data ?? []);
    } catch (error) {
      return fallbackAfterError(
        adminStorage.coupons.list(),
        error,
        "We could not load coupons right now.",
      );
    }
  },

  async create(input: CouponInput): Promise<ServiceResponse<CouponRow>> {
    const databaseInput = {
      active: input.active,
      code: input.code,
      expires_at: input.expiresAt,
      minimum_order_value: input.minimumOrderValue,
      type: input.type,
      usage_limit: input.usageLimit,
      value: input.value,
    };

    const localFallback = () =>
      adminStorage.coupons.create({
        ...databaseInput,
        expires_at: databaseInput.expires_at,
        minimum_order_value: databaseInput.minimum_order_value,
        usage_limit: databaseInput.usage_limit,
      });

    if (!supabase) {
      return mockResponse(localFallback());
    }

    try {
      const { data, error } = await supabase
        .from("coupons")
        .insert(databaseInput)
        .select("*")
        .single();

      if (error) throw error;

      return supabaseResponse(data);
    } catch (error) {
      return fallbackAfterError(
        localFallback(),
        error,
        "The coupon could not be saved to the database, so it was kept locally.",
      );
    }
  },

  async update(
    id: string,
    input: Partial<CouponInput>,
  ): Promise<ServiceResponse<CouponRow | null>> {
    const databaseInput = {
      ...(input.active === undefined ? {} : { active: input.active }),
      ...(input.code === undefined ? {} : { code: input.code }),
      ...(input.expiresAt === undefined
        ? {}
        : { expires_at: input.expiresAt }),
      ...(input.minimumOrderValue === undefined
        ? {}
        : { minimum_order_value: input.minimumOrderValue }),
      ...(input.type === undefined ? {} : { type: input.type }),
      ...(input.usageLimit === undefined
        ? {}
        : { usage_limit: input.usageLimit }),
      ...(input.value === undefined ? {} : { value: input.value }),
    };

    const localFallback = () =>
      adminStorage.coupons.update(id, databaseInput);

    if (!supabase) {
      return mockResponse(localFallback());
    }

    try {
      const { data, error } = await supabase
        .from("coupons")
        .update(databaseInput)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      return supabaseResponse(data);
    } catch (error) {
      return fallbackAfterError(
        localFallback(),
        error,
        "The coupon could not be updated in the database, so the change was kept locally.",
      );
    }
  },

  async incrementUsage(code: string): Promise<ServiceResponse<boolean>> {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      return mockResponse(false);
    }

    const localFallback = () => {
      const coupon = adminStorage.coupons
        .list()
        .find(
          (item) => item.code.trim().toUpperCase() === normalizedCode,
        );

      if (!coupon) return false;

      adminStorage.coupons.update(coupon.id, {
        used_count: coupon.used_count + 1,
      });

      return true;
    };

    if (!supabase) {
      return mockResponse(localFallback());
    }

    try {
      const { data, error } = await supabase.rpc("increment_coupon_usage", {
        p_code: normalizedCode,
      });

      if (error) throw error;

      return supabaseResponse(Boolean(data));
    } catch (error) {
      return fallbackAfterError(
        localFallback(),
        error,
        "Coupon usage could not be updated in the database, so it was updated locally.",
      );
    }
  },

  async remove(id: string): Promise<ServiceResponse<boolean>> {
    if (!supabase) {
      return mockResponse(adminStorage.coupons.remove(id));
    }

    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);

      if (error) throw error;

      return supabaseResponse(true);
    } catch (error) {
      return fallbackAfterError(
        adminStorage.coupons.remove(id),
        error,
        "The coupon could not be deleted from the database, so it was removed locally.",
      );
    }
  },
};