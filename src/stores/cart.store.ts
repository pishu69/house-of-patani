import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products } from "@/data/products";
import type {
  CartEntry,
  CartMutationResult,
} from "@/types/cart.types";

interface CartStore {
  addItem: (productId: string, quantity?: number) => CartMutationResult;
  clearCart: () => void;
  closeDrawer: () => void;
  decreaseQuantity: (productId: string) => CartMutationResult;
  increaseQuantity: (productId: string) => CartMutationResult;
  isDrawerOpen: boolean;
  items: CartEntry[];
  openDrawer: () => void;
  removeItem: (productId: string) => CartMutationResult;
  toggleDrawer: () => void;
  updateQuantity: (
    productId: string,
    quantity: number,
  ) => CartMutationResult;
}

function getProduct(productId: string) {
  return products.find((product) => product.id === productId);
}

function sanitizePersistedItems(value: unknown): CartEntry[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;

  if (!Array.isArray(record.items)) {
    return [];
  }

  return record.items.flatMap<CartEntry>((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const entry = item as Record<string, unknown>;

    if (
      typeof entry.productId !== "string" ||
      typeof entry.quantity !== "number"
    ) {
      return [];
    }

    const product = getProduct(entry.productId);

    if (!product || product.stock === 0) {
      return [];
    }

    return [
      {
        productId: product.id,
        quantity: Math.min(
          product.stock,
          Math.max(1, Math.floor(entry.quantity)),
        ),
      },
    ];
  });
}

function result(
  success: boolean,
  reason: CartMutationResult["reason"],
  quantity: number,
): CartMutationResult {
  return { quantity, reason, success };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      addItem: (productId, requestedQuantity = 1) => {
        const product = getProduct(productId);

        if (!product) {
          return result(false, "not-found", 0);
        }

        if (product.stock === 0) {
          return result(false, "out-of-stock", 0);
        }

        const quantityToAdd = Math.max(1, Math.floor(requestedQuantity));
        const existing = get().items.find(
          (item) => item.productId === productId,
        );
        const nextQuantity = (existing?.quantity ?? 0) + quantityToAdd;

        if (nextQuantity > product.stock) {
          return result(
            false,
            "stock-limit",
            existing?.quantity ?? product.stock,
          );
        }

        set((state) => ({
          items: existing
            ? state.items.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: nextQuantity }
                  : item,
              )
            : [...state.items, { productId, quantity: nextQuantity }],
        }));

        return result(true, existing ? "updated" : "added", nextQuantity);
      },
      clearCart: () => set({ items: [] }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      decreaseQuantity: (productId) => {
        const existing = get().items.find(
          (item) => item.productId === productId,
        );

        if (!existing) {
          return result(false, "not-found", 0);
        }

        if (existing.quantity <= 1) {
          return result(true, "updated", 1);
        }

        const nextQuantity = existing.quantity - 1;
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: nextQuantity }
              : item,
          ),
        }));
        return result(true, "updated", nextQuantity);
      },
      increaseQuantity: (productId) => {
        const existing = get().items.find(
          (item) => item.productId === productId,
        );

        if (!existing) {
          return result(false, "not-found", 0);
        }

        return get().updateQuantity(productId, existing.quantity + 1);
      },
      isDrawerOpen: false,
      items: [],
      openDrawer: () => set({ isDrawerOpen: true }),
      removeItem: (productId) => {
        const exists = get().items.some((item) => item.productId === productId);

        if (!exists) {
          return result(false, "not-found", 0);
        }

        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
        return result(true, "removed", 0);
      },
      toggleDrawer: () =>
        set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      updateQuantity: (productId, requestedQuantity) => {
        const product = getProduct(productId);
        const existing = get().items.find(
          (item) => item.productId === productId,
        );

        if (!product || !existing) {
          return result(false, "not-found", 0);
        }

        if (product.stock === 0) {
          return result(false, "out-of-stock", existing.quantity);
        }

        const nextQuantity = Math.max(1, Math.floor(requestedQuantity));

        if (nextQuantity > product.stock) {
          return result(false, "stock-limit", existing.quantity);
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: nextQuantity }
              : item,
          ),
        }));
        return result(true, "updated", nextQuantity);
      },
    }),
    {
      merge: (persistedState, currentState) => ({
        ...currentState,
        items: sanitizePersistedItems(persistedState),
      }),
      name: "house-of-patani-cart",
      partialize: (state) => ({ items: state.items }),
      version: 1,
    },
  ),
);
