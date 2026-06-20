import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  productIds: string[];
  clear: () => void;
  has: (productId: string) => boolean;
  remove: (productId: string) => void;
  toggle: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      clear: () => set({ productIds: [] }),
      has: (productId) => get().productIds.includes(productId),
      remove: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),
      toggle: (productId) => {
        const active = get().productIds.includes(productId);
        set((state) => ({
          productIds: active
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        }));
        return !active;
      },
    }),
    {
      name: "house-of-patani-wishlist",
      partialize: (state) => ({ productIds: state.productIds }),
      version: 1,
    },
  ),
);
