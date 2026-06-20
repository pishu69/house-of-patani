import { create } from "zustand";

import type {
  AdminAuthResolution,
  AdminAuthStatus,
  AdminSession,
} from "@/types/admin-auth.types";

interface AuthStore {
  error: string | null;
  session: AdminSession | null;
  status: AdminAuthStatus;
  applyResolution: (resolution: AdminAuthResolution) => void;
  setError: (error: string) => void;
  setLoading: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  error: null,
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
}));
