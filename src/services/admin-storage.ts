import {
  mockAdminCoupons,
  mockAdminOrders,
} from "@/data/admin";
import { shopCategories } from "@/data/categories";
import { products } from "@/data/products";
import type { StoreSettings } from "@/types/admin.types";
import type {
  CouponRow,
  OrderItemRow,
  OrderRow,
} from "@/types/database.types";
import type {
  CreateGuestOrderInput,
  OrderConfirmation,
  RazorpayPaymentReference,
} from "@/types/order.types";
import type {
  CatalogProduct,
  ProductInput,
  ProductMedia,
} from "@/types/product.types";

const STORAGE_PREFIX = "house-of-patani-admin";

export const defaultStoreSettings: StoreSettings = {
  address: "Kochi, Kerala, India",
  codEnabled: true,
  email: "care@houseofpatani.com",
  facebook: "https://facebook.com/houseofpatani",
  freeShippingThreshold: 5000,
  homepageBanner: "",
  homepageBannerPath: "",
  heroSubtitle: "Tradition Woven with Heritage",
  heroTitle: "House of Patani",
  heroDescription: "A refined marketplace for Indian craft, handwoven textiles, carved keepsakes, and objects that carry the warmth of home.",
  heroQuote: "Hand-selected craft, softened by time.",
  instagram: "https://instagram.com/houseofpatani",
  logoPath: "",
  logoUrl: "",
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

function createOrderNumber() {
  const date = new Date();
  const datePart = [
    String(date.getFullYear()).slice(-2),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  return `HOP-${datePart}-${String(Date.now()).slice(-5)}`;
}

export const adminStorage = {
  categories: {
    list() {
      return readValue("categories", shopCategories).map((category) => ({
        ...category,
        imagePath: category.imagePath ?? null,
      }));
    },
    create(input: {
      description: string;
      imagePath?: string | null;
      imageUrl?: string;
      name: string;
      slug: string;
    }) {
      const current = this.list();
      const created = {
        description: input.description,
        imagePath: input.imagePath ?? null,
        imageUrl: input.imageUrl ?? "",
        name: input.name,
        slug: input.slug,
      };
      writeValue("categories", [created, ...current]);
      return created;
    },
    update(
      slug: string,
      input: Partial<{
        description: string;
        imagePath: string | null;
        imageUrl: string;
        name: string;
        slug: string;
      }>,
    ) {
      let updated = null;
      const next = this.list().map((category) => {
        if (category.slug !== slug) return category;
        updated = { ...category, ...input };
        return updated;
      });
      writeValue("categories", next);
      return updated;
    },
    updateImage(slug: string, imageUrl: string, imagePath: string | null) {
      const categories = this.list().map((category) =>
        category.slug === slug
          ? { ...category, imagePath, imageUrl }
          : category,
      );
      writeValue("categories", categories);
      return categories.find((category) => category.slug === slug) ?? null;
    },
    remove(slug: string) {
      const current = this.list();
      const next = current.filter((category) => category.slug !== slug);
      writeValue("categories", next);
      return next.length !== current.length;
    },
  },
  productMedia: {
    get(productId: string) {
      return readValue<Record<string, ProductMedia[]>>(
        "product-media",
        {},
      )[productId];
    },
    set(productId: string, media: ProductMedia[]) {
      const current = readValue<Record<string, ProductMedia[]>>(
        "product-media",
        {},
      );
      writeValue("product-media", { ...current, [productId]: media });
      return media;
    },
    remove(productId: string) {
      const current = readValue<Record<string, ProductMedia[]>>(
        "product-media",
        {},
      );
      const remaining = { ...current };
      delete remaining[productId];
      writeValue("product-media", remaining);
    },
  },
  productOverrides: {
    get(productId: string) {
      return readValue<Record<string, Partial<CatalogProduct>>>(
        "product-overrides",
        {},
      )[productId];
    },
    set(productId: string, input: Partial<CatalogProduct>) {
      const current = readValue<Record<string, Partial<CatalogProduct>>>(
        "product-overrides",
        {},
      );
      const next = {
        ...(current[productId] ?? {}),
        ...input,
      };
      writeValue("product-overrides", {
        ...current,
        [productId]: next,
      });
      return next;
    },
  },
  products: {
    list() {
      return readValue<CatalogProduct[]>("products", []).map(
        (product) => {
          const media: ProductMedia[] =
            product.media ??
            product.images.map((url, index) => ({
              altText: `${product.name} view ${index + 1}`,
              id: `legacy-${product.id}-${index}`,
              isPrimary: index === 0,
              position: index,
              storagePath: null,
              url,
            }));

          return {
            ...product,
            images: media.map((image) => image.url),
            media,
          };
        },
      );
    },
    create(input: ProductInput) {
      const current = this.list();
      const created: CatalogProduct = {
        ...input,
        createdAt: new Date().toISOString(),
        id: createId("product"),
        images: [],
        media: [],
        rating: 0,
        reviewCount: 0,
      };
      writeValue("products", [created, ...current]);
      return created;
    },
    setMedia(id: string, media: ProductMedia[]) {
      adminStorage.productMedia.set(id, media);
      return this.update(id, {
        images: media
          .slice()
          .sort(
            (left, right) =>
              Number(right.isPrimary) - Number(left.isPrimary) ||
              left.position - right.position,
          )
          .map((image) => image.url),
        media,
      });
    },
    update(id: string, input: Partial<CatalogProduct>) {
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
    create(
      input: CreateGuestOrderInput,
      catalog: CatalogProduct[],
      shipping: number,
      paymentReference?: RazorpayPaymentReference,
    ): OrderConfirmation {
      const now = new Date().toISOString();
      const orderId = createId("order");
      const orderNumber = createOrderNumber();
      const orderItems: OrderItemRow[] = input.items.map((item) => {
        const product = catalog.find(
          (catalogProduct) =>
            catalogProduct.id === item.productId ||
            catalogProduct.sku === item.sku,
        );

        if (!product || !product.active || product.stock < item.quantity) {
          throw new Error("PRODUCT_UNAVAILABLE");
        }

        return {
          id: createId("order-item"),
          order_id: orderId,
          price: product.price,
          product_id: product.id,
          product_image: product.images[0] ?? null,
          product_name: product.name,
          quantity: item.quantity,
          total: product.price * item.quantity,
        };
      });
      const subtotal = orderItems.reduce(
        (total, item) => total + item.total,
        0,
      );
      const order: OrderRow = {
        created_at: now,
        customer_email: input.customerEmail.toLowerCase(),
        customer_id: null,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        discount: input.discount,
        id: orderId,
        notes: input.address.landmark || null,
        order_number: orderNumber,
        order_status: paymentReference ? "confirmed" : "pending",
        paid_at: paymentReference ? now : null,
        payment_method: paymentReference ? "razorpay" : "cod",
        payment_status: paymentReference ? "paid" : "pending",
        razorpay_order_id: paymentReference?.razorpayOrderId ?? null,
        razorpay_payment_id: paymentReference?.razorpayPaymentId ?? null,
        razorpay_signature: paymentReference?.razorpaySignature ?? null,
        shipping,
        shipping_address: {
          addressLine1: input.address.addressLine1,
          addressLine2: input.address.addressLine2,
          city: input.address.city,
          country: input.address.country,
          landmark: input.address.landmark,
          pincode: input.address.pincode,
          state: input.address.state,
        },
        subtotal,
        total: subtotal - input.discount + shipping,
        updated_at: now,
      };

      writeValue("orders", [order, ...this.list()]);
      this.saveConfirmation({ items: orderItems, order });
      catalog.forEach((product) => {
        const orderedItem = input.items.find(
          (item) =>
            item.productId === product.id || item.sku === product.sku,
        );
        if (orderedItem) {
          adminStorage.products.update(product.id, {
            stock: product.stock - orderedItem.quantity,
          });
          adminStorage.productOverrides.set(product.id, {
            stock: product.stock - orderedItem.quantity,
          });
        }
      });

      return { items: orderItems, order };
    },
    saveConfirmation(confirmation: OrderConfirmation) {
      const confirmations = readValue<Record<string, OrderConfirmation>>(
        "order-confirmations",
        {},
      );
      writeValue("order-confirmations", {
        ...confirmations,
        [confirmation.order.order_number]: confirmation,
      });
      return confirmation;
    },
    getConfirmation(orderNumber: string) {
      return (
        readValue<Record<string, OrderConfirmation>>(
          "order-confirmations",
          {},
        )[orderNumber] ?? null
      );
    },
    listConfirmations() {
      return Object.values(
        readValue<Record<string, OrderConfirmation>>(
          "order-confirmations",
          {},
        ),
      );
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
      return {
        ...defaultStoreSettings,
        ...readValue<Partial<StoreSettings>>("settings", {}),
      };
    },
    update(input: StoreSettings) {
      return writeValue("settings", input);
    },
  },
};




