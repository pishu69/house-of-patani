import { create } from "zustand";

import type {
  CustomerAuthResolution,
  CustomerAuthSession,
  CustomerAuthStatus,
} from "@/types/customer-auth.types";

interface CustomerAuthStore {
  error: string | null;
  pendingPhone: string;
  session: CustomerAuthSession | null;
  status: CustomerAuthStatus;
  applyResolution: (resolution: CustomerAuthResolution) => void;
  setError: (error: string) => void;
  setLoading: () => void;
  setPendingPhone: (phone: string) => void;
}

export const useCustomerAuthStore = create<CustomerAuthStore>((set) => ({
  error: null,
  pendingPhone: "",
  session: null,
  status: "idle",
  applyResolution: (resolution) =>
    set({
      error: resolution.error,
      session: resolution.session,
      status: resolution.status,
    }),
  setError: (error) =>
    set({
      error,
      session: null,
      status: "unauthenticated",
    }),
  setLoading: () => set({ error: null, status: "loading" }),
  setPendingPhone: (pendingPhone) => set({ pendingPhone }),
}));
