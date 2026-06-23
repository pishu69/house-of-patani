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
import { storageService } from "@/services/storage.service";
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
    homepageBannerPath: settings.homepageBannerPath,
    heroSubtitle: settings.heroSubtitle,
    heroTitle: settings.heroTitle,
    heroDescription: settings.heroDescription,
    heroQuote: settings.heroQuote,
    aboutHeroEyebrow: settings.aboutHeroEyebrow,
    aboutHeroTitle: settings.aboutHeroTitle,
    aboutHeroDescription: settings.aboutHeroDescription,
    heritageEyebrow: settings.heritageEyebrow,
    heritageTitle: settings.heritageTitle,
    heritageDescription: settings.heritageDescription,
    artisanEyebrow: settings.artisanEyebrow,
    artisanTitle: settings.artisanTitle,
    artisanDescription: settings.artisanDescription,
    instagram: settings.instagram,
    logoPath: settings.logoPath,
    logoUrl: settings.logoUrl,
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
    homepageBannerPath:
      typeof value.homepageBannerPath === "string"
        ? value.homepageBannerPath
        : defaultStoreSettings.homepageBannerPath,
    heroSubtitle:
      typeof value.heroSubtitle === "string"
        ? value.heroSubtitle
        : defaultStoreSettings.heroSubtitle,
    heroTitle:
      typeof value.heroTitle === "string"
        ? value.heroTitle
        : defaultStoreSettings.heroTitle,
    heroDescription:
      typeof value.heroDescription === "string"
        ? value.heroDescription
        : defaultStoreSettings.heroDescription,
    heroQuote:
      typeof value.heroQuote === "string"
        ? value.heroQuote
        : defaultStoreSettings.heroQuote,
    aboutHeroEyebrow:
      typeof value.aboutHeroEyebrow === "string"
        ? value.aboutHeroEyebrow
        : defaultStoreSettings.aboutHeroEyebrow,
    aboutHeroTitle:
      typeof value.aboutHeroTitle === "string"
        ? value.aboutHeroTitle
        : defaultStoreSettings.aboutHeroTitle,
    aboutHeroDescription:
      typeof value.aboutHeroDescription === "string"
        ? value.aboutHeroDescription
        : defaultStoreSettings.aboutHeroDescription,
    heritageEyebrow:
      typeof value.heritageEyebrow === "string"
        ? value.heritageEyebrow
        : defaultStoreSettings.heritageEyebrow,
    heritageTitle:
      typeof value.heritageTitle === "string"
        ? value.heritageTitle
        : defaultStoreSettings.heritageTitle,
    heritageDescription:
      typeof value.heritageDescription === "string"
        ? value.heritageDescription
        : defaultStoreSettings.heritageDescription,
    artisanEyebrow:
      typeof value.artisanEyebrow === "string"
        ? value.artisanEyebrow
        : defaultStoreSettings.artisanEyebrow,
    artisanTitle:
      typeof value.artisanTitle === "string"
        ? value.artisanTitle
        : defaultStoreSettings.artisanTitle,
    artisanDescription:
      typeof value.artisanDescription === "string"
        ? value.artisanDescription
        : defaultStoreSettings.artisanDescription,
    instagram:
      typeof value.instagram === "string"
        ? value.instagram
        : defaultStoreSettings.instagram,
    logoPath:
      typeof value.logoPath === "string"
        ? value.logoPath
        : defaultStoreSettings.logoPath,
    logoUrl:
      typeof value.logoUrl === "string"
        ? value.logoUrl
        : defaultStoreSettings.logoUrl,
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
    const localSettings = adminStorage.settings.get();

    if (
      !supabase ||
      localSettings.homepageBannerPath.startsWith("local/") ||
      localSettings.logoPath.startsWith("local/")
    ) {
      const settings = localSettings;
      return mockResponse({
        ...settings,
        homepageBanner: await storageService.resolveImageUrl(
          settings.homepageBanner,
          settings.homepageBannerPath || null,
        ),
        logoUrl: await storageService.resolveImageUrl(
          settings.logoUrl,
          settings.logoPath || null,
        ),
      });
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
    const storedInput = {
      ...input,
      homepageBanner: input.homepageBannerPath.startsWith("local/")
        ? input.homepageBannerPath
        : input.homepageBanner,
      logoUrl: input.logoPath.startsWith("local/")
        ? input.logoPath
        : input.logoUrl,
    };

    if (
      !supabase ||
      input.homepageBannerPath.startsWith("local/") ||
      input.logoPath.startsWith("local/")
    ) {
      adminStorage.settings.update(storedInput);
      return mockResponse(input);
    }

    try {
      const { error } = await supabase.from("settings").upsert(
        {
          key: STORE_SETTINGS_KEY,
          value: toJson(storedInput),
        },
        { onConflict: "key" },
      );

      if (error) throw error;
      return supabaseResponse(input);
    } catch (error) {
      return fallbackAfterError(
        adminStorage.settings.update(storedInput),
        error,
        "The settings could not be saved to the database, so they were kept locally.",
      );
    }
  },
};







