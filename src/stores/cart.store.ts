import { create } from "zustand";

type CartStore = Record<string, never>;

export const useCartStore = create<CartStore>(() => ({}));
