import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import {
  adminStorage,
  defaultStoreSettings,
} from "@/services/admin-storage";
import { fallbackAfterError } from "@/services/service.utils";
import type { StoreSettings } from "@/types/admin.types";
import type { Json } from "@/types/database.types";

const STORE_SETTINGS_KEY = "store";

function toJson(settings: StoreSettings): Json {
  return {
    address: settings.address,
    codEnabled: settings.codEnabled,
    email: settings.email,
    facebook: settings.facebook,
    freeShippingThreshold: settings.freeShippingThreshold,
    homepageBanner: settings.homepageBanner,
    instagram: settings.instagram,
    razorpayEnabled: settings.razorpayEnabled,
    shippingCharge: settings.shippingCharge,
    storeName: settings.storeName,
    whatsappNumber: settings.whatsappNumber,
  };
}

function fromJson(value: Json): StoreSettings {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return defaultStoreSettings;
  }

  return {
    address:
      typeof value.address === "string"
        ? value.address
        : defaultStoreSettings.address,
    codEnabled:
      typeof value.codEnabled === "boolean"
        ? value.codEnabled
        : defaultStoreSettings.codEnabled,
    email:
      typeof value.email === "string"
        ? value.email
        : defaultStoreSettings.email,
    facebook:
      typeof value.facebook === "string"
        ? value.facebook
        : defaultStoreSettings.facebook,
    freeShippingThreshold:
      typeof value.freeShippingThreshold === "number"
        ? value.freeShippingThreshold
        : defaultStoreSettings.freeShippingThreshold,
    homepageBanner:
      typeof value.homepageBanner === "string"
        ? value.homepageBanner
        : defaultStoreSettings.homepageBanner,
    instagram:
      typeof value.instagram === "string"
        ? value.instagram
        : defaultStoreSettings.instagram,
    razorpayEnabled:
      typeof value.razorpayEnabled === "boolean"
        ? value.razorpayEnabled
        : defaultStoreSettings.razorpayEnabled,
    shippingCharge:
      typeof value.shippingCharge === "number"
        ? value.shippingCharge
        : defaultStoreSettings.shippingCharge,
    storeName:
      typeof value.storeName === "string"
        ? value.storeName
        : defaultStoreSettings.storeName,
    whatsappNumber:
      typeof value.whatsappNumber === "string"
        ? value.whatsappNumber
        : defaultStoreSettings.whatsappNumber,
  };
}

export const settingService = {
  async get(): Promise<ServiceResponse<StoreSettings>> {
    if (!supabase) {
      return mockResponse(adminStorage.settings.get());
    }

    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", STORE_SETTINGS_KEY)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data
        ? supabaseResponse(fromJson(data.value))
        : mockResponse(adminStorage.settings.get());
    } catch (error) {
      return fallbackAfterError(
        adminStorage.settings.get(),
        error,
        "We could not load store settings right now.",
      );
    }
  },

  async update(
    input: StoreSettings,
  ): Promise<ServiceResponse<StoreSettings>> {
    if (!supabase) {
      return mockResponse(adminStorage.settings.update(input));
    }

    try {
      const { error } = await supabase.from("settings").upsert(
        {
          key: STORE_SETTINGS_KEY,
          value: toJson(input),
        },
        { onConflict: "key" },
      );

      if (error) throw error;
      return supabaseResponse(input);
    } catch (error) {
      return fallbackAfterError(
        adminStorage.settings.update(input),
        error,
        "The settings could not be saved to the database, so they were kept locally.",
      );
    }
  },
};
