import {
  mockAdminCoupons,
  mockAdminOrders,
} from "@/data/admin";
import { products } from "@/data/products";
import type { StoreSettings } from "@/types/admin.types";
import type { CouponRow, OrderRow } from "@/types/database.types";
import type {
  CatalogProduct,
  ProductInput,
} from "@/types/product.types";

const STORAGE_PREFIX = "house-of-patani-admin";

export const defaultStoreSettings: StoreSettings = {
  address: "Kochi, Kerala, India",
  codEnabled: true,
  email: "care@houseofpatani.com",
  facebook: "https://facebook.com/houseofpatani",
  freeShippingThreshold: 5000,
  homepageBanner: "",
  instagram: "https://instagram.com/houseofpatani",
  razorpayEnabled: false,
  shippingCharge: 250,
  storeName: "House of Patani",
  whatsappNumber: "+91 98765 43210",
};

const memoryStore = new Map<string, string>();

function storageKey(key: string) {
  return `${STORAGE_PREFIX}:${key}`;
}

function getStoredValue(key: string) {
  const resolvedKey = storageKey(key);

  if (typeof window !== "undefined") {
    return window.localStorage.getItem(resolvedKey);
  }

  return memoryStore.get(resolvedKey) ?? null;
}

function setStoredValue(key: string, value: string) {
  const resolvedKey = storageKey(key);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(resolvedKey, value);
    return;
  }

  memoryStore.set(resolvedKey, value);
}

function readValue<T>(key: string, fallback: T): T {
  const stored = getStoredValue(key);

  if (!stored) {
    return structuredClone(fallback);
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    return structuredClone(fallback);
  }
}

function writeValue<T>(key: string, value: T) {
  setStoredValue(key, JSON.stringify(value));
  return structuredClone(value);
}

function createId(prefix: string) {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefix}-${randomId}`;
}

export const adminStorage = {
  products: {
    list() {
      return readValue<CatalogProduct[]>("products", products);
    },
    create(input: ProductInput) {
      const current = this.list();
      const created: CatalogProduct = {
        ...input,
        createdAt: new Date().toISOString(),
        id: createId("product"),
        images: [],
        rating: 0,
        reviewCount: 0,
      };
      writeValue("products", [created, ...current]);
      return created;
    },
    update(id: string, input: Partial<ProductInput>) {
      let updated: CatalogProduct | null = null;
      const next = this.list().map((product) => {
        if (product.id !== id) return product;
        updated = { ...product, ...input };
        return updated;
      });

      writeValue("products", next);
      return updated;
    },
    remove(id: string) {
      const current = this.list();
      const next = current.filter((product) => product.id !== id);
      writeValue("products", next);
      return next.length !== current.length;
    },
  },
  orders: {
    list() {
      return readValue<OrderRow[]>("orders", mockAdminOrders);
    },
    update(id: string, input: Partial<OrderRow>) {
      let updated: OrderRow | null = null;
      const next = this.list().map((order) => {
        if (order.id !== id) return order;
        updated = {
          ...order,
          ...input,
          updated_at: new Date().toISOString(),
        };
        return updated;
      });

      writeValue("orders", next);
      return updated;
    },
  },
  coupons: {
    list() {
      return readValue<CouponRow[]>("coupons", mockAdminCoupons);
    },
    create(input: Omit<CouponRow, "created_at" | "id" | "used_count">) {
      const created: CouponRow = {
        ...input,
        created_at: new Date().toISOString(),
        id: createId("coupon"),
        used_count: 0,
      };
      writeValue("coupons", [created, ...this.list()]);
      return created;
    },
    update(id: string, input: Partial<CouponRow>) {
      let updated: CouponRow | null = null;
      const next = this.list().map((coupon) => {
        if (coupon.id !== id) return coupon;
        updated = { ...coupon, ...input };
        return updated;
      });

      writeValue("coupons", next);
      return updated;
    },
    remove(id: string) {
      const current = this.list();
      const next = current.filter((coupon) => coupon.id !== id);
      writeValue("coupons", next);
      return next.length !== current.length;
    },
  },
  settings: {
    get() {
      return readValue<StoreSettings>("settings", defaultStoreSettings);
    },
    update(input: StoreSettings) {
      return writeValue("settings", input);
    },
  },
};
