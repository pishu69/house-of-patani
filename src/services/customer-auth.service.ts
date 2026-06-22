import type { Session } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useCustomerStore } from "@/stores/customer.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import type {
  CustomerAuthResolution,
  CustomerAuthSession,
  SendOtpInput,
  SendOtpResult,
  VerifyOtpInput,
} from "@/types/customer-auth.types";
import type {
  CustomerAddress,
  CustomerProfile,
} from "@/types/customer-account.types";
import type {
  AddressRow,
  CustomerRow,
  WishlistRow,
} from "@/types/database.types";

const DEMO_SESSION_KEY = "house-of-patani-demo-customer";
const PENDING_PHONE_KEY = "house-of-patani-otp-phone";
export const DEMO_CUSTOMER_OTP = "123456";

interface VerifyOtpResponse {
  account: {
    addresses: AddressRow[];
    customer: CustomerRow;
    wishlistProductIds: string[];
  };
  tokenHash: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return `+91${digits}`;
}

function canUseDemoCustomer() {
  return import.meta.env.DEV && !isSupabaseConfigured;
}

function unauthenticated(error: string | null = null): CustomerAuthResolution {
  return { error, session: null, status: "unauthenticated" };
}

function authenticated(session: CustomerAuthSession): CustomerAuthResolution {
  return { error: null, session, status: "authenticated" };
}

function toProfile(customer: CustomerRow): CustomerProfile {
  return {
    email: customer.email.includes("@auth.houseofpatani.invalid")
      ? ""
      : customer.email,
    name:
      customer.name === "House of Patani Customer" ? "" : customer.name,
    phone: customer.phone ?? "",
  };
}

function toAddress(row: AddressRow): CustomerAddress {
  return {
    city: row.city,
    country: row.country,
    id: row.id,
    isDefault: row.is_default,
    label: row.label ?? "Address",
    line1: row.line1,
    line2: row.line2 ?? "",
    postalCode: row.postal_code,
    state: row.state,
  };
}

function mergeAccount(
  customer: CustomerRow,
  addresses: AddressRow[],
  wishlistProductIds: string[],
) {
  const localProfile = useCustomerStore.getState().profile;
  const remoteProfile = toProfile(customer);
  useCustomerStore.getState().updateProfile({
    email: remoteProfile.email || localProfile.email,
    name: remoteProfile.name || localProfile.name,
    phone: remoteProfile.phone || localProfile.phone,
  });

  if (addresses.length > 0) {
    useCustomerStore
      .getState()
      .replaceAddresses(addresses.map(toAddress));
  }

  const localWishlist = useWishlistStore.getState().productIds;
  useWishlistStore.setState({
    productIds: [...new Set([...localWishlist, ...wishlistProductIds])],
  });
}

function parseVerifyResponse(value: unknown): VerifyOtpResponse {
  if (
    !isRecord(value) ||
    typeof value.tokenHash !== "string" ||
    !isRecord(value.account) ||
    !isRecord(value.account.customer) ||
    !Array.isArray(value.account.addresses) ||
    !Array.isArray(value.account.wishlistProductIds)
  ) {
    throw new Error("The verification service returned an invalid response.");
  }

  return value as unknown as VerifyOtpResponse;
}

async function resolveSupabaseSession(
  session: Session | null,
): Promise<CustomerAuthResolution> {
  if (!session || !supabase) return unauthenticated();

  let { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("auth_user_id", session.user.id)
    .eq("active", true)
    .maybeSingle();

  if (!customer && !error) {
    const result = await (supabase as any).rpc("upsert_customer_from_auth");
    customer = result.data as any;
    error = result.error;
  }

  if (error || !customer) return unauthenticated();

  const [addressesResult, wishlistResult] = await Promise.all([
    supabase
      .from("addresses")
      .select("*")
      .eq("customer_id", customer.id)
      .order("is_default", { ascending: false }),
    supabase
      .from("wishlists")
      .select("*")
      .eq("customer_id", customer.id),
  ]);

  const wishlistIds = (wishlistResult.data ?? []).map(
    (item: WishlistRow) => item.product_id,
  );
  mergeAccount(customer, addressesResult.data ?? [], wishlistIds);

  return authenticated({
    customerId: customer.id,
    isDemo: false,
    phone: customer.phone ?? "",
    profile: useCustomerStore.getState().profile,
    userId: session.user.id,
  });
}

function demoSession(phone: string): CustomerAuthSession {
  const profile = useCustomerStore.getState().profile;
  const normalizedPhone = normalizePhone(phone);
  const nextProfile = { ...profile, phone: normalizedPhone };
  useCustomerStore.getState().updateProfile(nextProfile);
  return {
    customerId: "demo-customer",
    isDemo: true,
    phone: normalizedPhone,
    profile: nextProfile,
    userId: "demo-customer-user",
  };
}

async function getFriendlyFunctionError(
  context: unknown,
  fallback: string,
): Promise<string> {
  if (context instanceof Response) {
    try {
      const payload: unknown = await context.clone().json();
      if (
        isRecord(payload) &&
        typeof payload.message === "string"
      ) {
        return payload.message;
      }
    } catch {
      return fallback;
    }
  }
  if (
    isRecord(context) &&
    isRecord(context.response) &&
    typeof context.response.message === "string"
  ) {
    return context.response.message;
  }
  return fallback;
}

export const customerAuthService = {
  canUseDemoCustomer,
  isConfigured: () => isSupabaseConfigured,

  getPendingPhone() {
    return typeof window === "undefined"
      ? ""
      : window.sessionStorage.getItem(PENDING_PHONE_KEY) ?? "";
  },

  setPendingPhone(phone: string) {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(PENDING_PHONE_KEY, phone);
    }
  },

  clearPendingPhone() {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(PENDING_PHONE_KEY);
    }
  },

  async getCurrentSession(): Promise<CustomerAuthResolution> {
    if (
      canUseDemoCustomer() &&
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(DEMO_SESSION_KEY)
    ) {
      return authenticated(
        demoSession(window.sessionStorage.getItem(DEMO_SESSION_KEY) ?? ""),
      );
    }

    if (!supabase) return unauthenticated();
    const { data, error } = await supabase.auth.getSession();
    if (error) return unauthenticated();
    return resolveSupabaseSession(data.session);
  },

  async sendOtp(input: SendOtpInput): Promise<SendOtpResult> {
    const phone = normalizePhone(input.phone);
    this.setPendingPhone(phone);

    if (!supabase) {
      if (!canUseDemoCustomer()) {
        throw new Error("OTP login is not configured yet.");
      }
      return {
        cooldownSeconds: 30,
        demoOtp: DEMO_CUSTOMER_OTP,
        phone,
      };
    }

    const { data, error } = await supabase.functions.invoke("send-otp", {
      body: { phone, resend: Boolean(input.resend) },
    });
    if (error) {
      throw new Error(
        await getFriendlyFunctionError(
          error.context,
          "OTP login is not configured yet.",
        ),
      );
    }
    if (
      !isRecord(data) ||
      typeof data.cooldownSeconds !== "number" ||
      typeof data.phone !== "string"
    ) {
      throw new Error("The OTP service returned an invalid response.");
    }
    return {
      cooldownSeconds: data.cooldownSeconds,
      phone: data.phone,
    };
  },

  async verifyOtp(input: VerifyOtpInput): Promise<CustomerAuthResolution> {
    const phone = normalizePhone(input.phone);

    if (!supabase) {
      if (!canUseDemoCustomer() || input.otp !== DEMO_CUSTOMER_OTP) {
        return unauthenticated("The OTP is incorrect or has expired.");
      }
      window.sessionStorage.setItem(DEMO_SESSION_KEY, phone);
      this.clearPendingPhone();
      return authenticated(demoSession(phone));
    }

    const { data, error } = await supabase.functions.invoke("verify-otp", {
      body: {
        addresses: input.addresses,
        email: input.email,
        name: input.name,
        otp: input.otp,
        phone,
        wishlistProductIds: input.wishlistProductIds,
      },
    });
    if (error) {
      return unauthenticated(
        await getFriendlyFunctionError(
          error.context,
          "The OTP is incorrect or has expired.",
        ),
      );
    }

    const verified = parseVerifyResponse(data);
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      token_hash: verified.tokenHash,
      type: "magiclink",
    });
    if (authError || !authData.session) {
      return unauthenticated(
        "Your mobile was verified, but the customer session could not start.",
      );
    }

    mergeAccount(
      verified.account.customer,
      verified.account.addresses,
      verified.account.wishlistProductIds,
    );
    this.clearPendingPhone();
    return authenticated({
      customerId: verified.account.customer.id,
      isDemo: false,
      phone,
      profile: useCustomerStore.getState().profile,
      userId: authData.session.user.id,
    });
  },

  async logout(): Promise<CustomerAuthResolution> {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    }
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error("You could not be signed out.");
    }
    return unauthenticated();
  },

  onAuthStateChange(
    callback: (resolution: CustomerAuthResolution) => void,
  ) {
    if (!supabase) return () => undefined;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void resolveSupabaseSession(session)
          .then(callback)
          .catch(() =>
            callback(
              unauthenticated(
                "Your customer session could not be restored.",
              ),
            ),
          );
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  },
};






