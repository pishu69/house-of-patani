import { useCallback, useEffect } from "react";

import { adminAuthService } from "@/services/admin-auth.service";
import { useAuthStore } from "@/stores/auth.store";
import type { AdminLoginInput } from "@/types/admin-auth.types";

let initialization: Promise<void> | null = null;
let isListening = false;

async function initializeAuth(force = false) {
  if (force || !initialization) {
    useAuthStore.getState().setLoading();
    initialization = adminAuthService
      .getCurrentSession()
      .then(useAuthStore.getState().applyResolution)
      .catch((error: unknown) => {
        useAuthStore
          .getState()
          .setError(
            error instanceof Error
              ? error.message
              : "Administrator access could not be checked.",
          );
      });
  }

  return initialization;
}

function ensureAuthListener() {
  if (isListening) return;
  isListening = true;
  adminAuthService.onAuthStateChange((resolution) => {
    useAuthStore.getState().applyResolution(resolution);
  });
}

export function useAuth() {
  const auth = useAuthStore();

  useEffect(() => {
    ensureAuthListener();
    void initializeAuth();
  }, []);

  const login = useCallback(async (input: AdminLoginInput) => {
    useAuthStore.getState().setLoading();
    const resolution = await adminAuthService.login(input);
    useAuthStore.getState().applyResolution(resolution);
    return resolution;
  }, []);

  const logout = useCallback(async () => {
    useAuthStore.getState().setLoading();
    const resolution = await adminAuthService.logout();
    useAuthStore.getState().applyResolution(resolution);
  }, []);

  const refresh = useCallback(() => initializeAuth(true), []);

  return {
    ...auth,
    canUseDemoAdmin: adminAuthService.canUseDemoAdmin(),
    isConfigured: adminAuthService.isConfigured(),
    login,
    logout,
    refresh,
  };
}
