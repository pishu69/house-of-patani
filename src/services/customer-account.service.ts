import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { adminStorage } from "@/services/admin-storage";
import { fallbackAfterError } from "@/services/service.utils";
import { useCustomerStore } from "@/stores/customer.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import type {
  CustomerAccountSnapshot,
  CustomerAddress,
  CustomerProfile,
  GuestOrderLookupInput,
  GuestOrderLookupResult,
} from "@/types/customer-account.types";
import type { Json, OrderItemRow, OrderRow } from "@/types/database.types";
import type { OrderConfirmation } from "@/types/order.types";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

function contactMatches(order: OrderRow, contact: string) {
  const normalized = contact.trim();
  return normalized.includes("@")
    ? normalizeEmail(order.customer_email) === normalizeEmail(normalized)
    : normalizePhone(order.customer_phone) === normalizePhone(normalized);
}

function profileMatches(order: OrderRow, profile: CustomerProfile) {
  return (
    (Boolean(profile.email) &&
      normalizeEmail(order.customer_email) === normalizeEmail(profile.email)) ||
    (Boolean(profile.phone) &&
      normalizePhone(order.customer_phone) === normalizePhone(profile.phone))
  );
}

function isOrderRow(value: unknown): value is OrderRow {
  return (
    typeof value === "object" &&
    value !== null &&
    "order_number" in value &&
    typeof value.order_number === "string"
  );
}

function isOrderItemRow(value: unknown): value is OrderItemRow {
  return (
    typeof value === "object" &&
    value !== null &&
    "product_name" in value &&
    typeof value.product_name === "string"
  );
}

function parseConfirmation(value: Json): OrderConfirmation {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !isOrderRow(value.order) ||
    !Array.isArray(value.items)
  ) {
    throw new Error("INVALID_ORDER_LOOKUP_RESPONSE");
  }

  const items = value.items.flatMap<OrderItemRow>((item) =>
    isOrderItemRow(item) ? [item] : [],
  );
  if (items.length !== value.items.length) {
    throw new Error("INVALID_ORDER_LOOKUP_RESPONSE");
  }

  return { items, order: value.order };
}

async function getCurrentCustomerId() {
  if (!supabase) return null;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const { data, error } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_user_id", authData.user.id)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function getSupabaseConfirmation(order: OrderRow) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);
  if (error) throw error;
  return { items: data ?? [], order };
}

export const customerAccountService = {
  getSnapshot(): ServiceResponse<CustomerAccountSnapshot> {
    const { addresses, profile } = useCustomerStore.getState();
    return mockResponse({ addresses, profile });
  },

  saveProfile(profile: CustomerProfile): ServiceResponse<CustomerProfile> {
    useCustomerStore.getState().updateProfile(profile);
    return mockResponse(profile);
  },

  addAddress(
    address: Omit<CustomerAddress, "id">,
  ): ServiceResponse<CustomerAddress> {
    return mockResponse(useCustomerStore.getState().addAddress(address));
  },

  updateAddress(
    id: string,
    address: Omit<CustomerAddress, "id">,
  ): ServiceResponse<CustomerAddress | null> {
    return mockResponse(
      useCustomerStore.getState().updateAddress(id, address),
    );
  },

  removeAddress(id: string): ServiceResponse<boolean> {
    const exists = useCustomerStore
      .getState()
      .addresses.some((address) => address.id === id);
    useCustomerStore.getState().removeAddress(id);
    return mockResponse(exists);
  },

  setDefaultAddress(id: string): ServiceResponse<boolean> {
    const exists = useCustomerStore
      .getState()
      .addresses.some((address) => address.id === id);
    if (exists) useCustomerStore.getState().setDefaultAddress(id);
    return mockResponse(exists);
  },

  async syncAuthenticatedAccount(): Promise<void> {
    if (!supabase) return;

    const customerId = await getCurrentCustomerId();
    if (!customerId) return;
    const { profile, addresses } = useCustomerStore.getState();
    const wishlistProductIds = useWishlistStore.getState().productIds;
    const { error } = await supabase.rpc("sync_customer_account", {
      p_addresses: addresses.map((address) => ({
        city: address.city,
        country: address.country,
        isDefault: address.isDefault,
        label: address.label,
        line1: address.line1,
        line2: address.line2,
        postalCode: address.postalCode,
        state: address.state,
      })),
      p_email: profile.email,
      p_name: profile.name,
      p_wishlist_product_ids: wishlistProductIds,
    });
    if (error) throw error;
  },

  async listOrders(
    profile: CustomerProfile,
  ): Promise<ServiceResponse<OrderRow[]>> {
    const localOrders = adminStorage.orders
      .list()
      .filter((order) => profileMatches(order, profile));

    if (!supabase) return mockResponse(localOrders);

    try {
      const customerId = await getCurrentCustomerId();
      if (!customerId) return mockResponse(localOrders);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return supabaseResponse(data ?? []);
    } catch (error) {
      return fallbackAfterError(
        localOrders,
        error,
        "We could not refresh your orders right now.",
      );
    }
  },

  async getOrder(
    orderNumber: string,
    profile: CustomerProfile,
  ): Promise<ServiceResponse<OrderConfirmation | null>> {
    const localOrder = adminStorage.orders
      .list()
      .find(
        (order) =>
          order.order_number === orderNumber &&
          profileMatches(order, profile),
      );
    const localConfirmation = localOrder
      ? adminStorage.orders.getConfirmation(orderNumber) ?? {
          items: [],
          order: localOrder,
        }
      : null;

    if (!supabase) return mockResponse(localConfirmation);

    try {
      const customerId = await getCurrentCustomerId();
      if (!customerId) return mockResponse(localConfirmation);
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", customerId)
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (error) throw error;
      if (!order) return mockResponse(localConfirmation);
      return supabaseResponse(
        (await getSupabaseConfirmation(order)) ?? localConfirmation,
      );
    } catch (error) {
      return fallbackAfterError(
        localConfirmation,
        error,
        "We could not refresh this order right now.",
      );
    }
  },

  async lookupGuestOrder(
    input: GuestOrderLookupInput,
  ): Promise<ServiceResponse<GuestOrderLookupResult>> {
    const localOrder = adminStorage.orders
      .list()
      .find(
        (order) =>
          order.order_number.toLowerCase() ===
            input.orderNumber.trim().toLowerCase() &&
          contactMatches(order, input.contact),
      );
    const localConfirmation = localOrder
      ? adminStorage.orders.getConfirmation(localOrder.order_number) ?? {
          items: [],
          order: localOrder,
        }
      : null;

    if (!supabase) return mockResponse(localConfirmation);

    try {
      const { data, error } = await supabase.rpc("lookup_guest_order", {
        p_contact: input.contact.trim(),
        p_order_number: input.orderNumber.trim(),
      });
      if (error) throw error;
      return data
        ? supabaseResponse(parseConfirmation(data))
        : mockResponse(localConfirmation);
    } catch (error) {
      return fallbackAfterError(
        localConfirmation,
        error,
        "We could not look up this order right now.",
      );
    }
  },
};
