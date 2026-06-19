import { create } from "zustand";

type WishlistStore = Record<string, never>;

export const useWishlistStore = create<WishlistStore>(() => ({}));
