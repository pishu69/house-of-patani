import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { fallbackAfterError } from "@/services/service.utils";
import type { SettingRow } from "@/types/database.types";

export const settingService = {
  async list(): Promise<ServiceResponse<SettingRow[]>> {
    if (!supabase) {
      return mockResponse([]);
    }

    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order("key");

      if (error) {
        throw error;
      }

      return supabaseResponse(data ?? []);
    } catch (error) {
      return fallbackAfterError(
        [],
        error,
        "We could not load store settings right now.",
      );
    }
  },
};
