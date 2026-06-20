import { useCallback, useEffect } from "react";

import { customerAuthService } from "@/services/customer-auth.service";
import { useCustomerAuthStore } from "@/stores/customer-auth.store";
import type {
  SendOtpInput,
  VerifyOtpInput,
} from "@/types/customer-auth.types";

let initialization: Promise<void> | null = null;
let isListening = false;

async function initialize(force = false) {
  if (force || !initialization) {
    useCustomerAuthStore.getState().setLoading();
    initialization = customerAuthService
      .getCurrentSession()
      .then(useCustomerAuthStore.getState().applyResolution)
      .catch((error: unknown) =>
        useCustomerAuthStore
          .getState()
          .setError(
            error instanceof Error
              ? error.message
              : "Customer access could not be checked.",
          ),
      );
  }
  return initialization;
}

function ensureListener() {
  if (isListening) return;
  isListening = true;
  customerAuthService.onAuthStateChange((resolution) => {
    useCustomerAuthStore.getState().applyResolution(resolution);
  });
}

export function useCustomerAuth() {
  const auth = useCustomerAuthStore();

  useEffect(() => {
    ensureListener();
    const pendingPhone = customerAuthService.getPendingPhone();
    if (pendingPhone) {
      useCustomerAuthStore.getState().setPendingPhone(pendingPhone);
    }
    void initialize();
  }, []);

  const sendOtp = useCallback(async (input: SendOtpInput) => {
    useCustomerAuthStore.getState().setLoading();
    try {
      const result = await customerAuthService.sendOtp(input);
      useCustomerAuthStore.getState().setPendingPhone(result.phone);
      useCustomerAuthStore.getState().applyResolution({
        error: null,
        session: null,
        status: "unauthenticated",
      });
      return result;
    } catch (error) {
      useCustomerAuthStore
        .getState()
        .setError(
          error instanceof Error
            ? error.message
            : "OTP login is not configured yet.",
        );
      throw error;
    }
  }, []);

  const verifyOtp = useCallback(async (input: VerifyOtpInput) => {
    useCustomerAuthStore.getState().setLoading();
    const resolution = await customerAuthService.verifyOtp(input);
    useCustomerAuthStore.getState().applyResolution(resolution);
    return resolution;
  }, []);

  const logout = useCallback(async () => {
    useCustomerAuthStore.getState().setLoading();
    const resolution = await customerAuthService.logout();
    useCustomerAuthStore.getState().applyResolution(resolution);
  }, []);

  return {
    ...auth,
    pendingPhone:
      auth.pendingPhone || customerAuthService.getPendingPhone(),
    canUseDemoCustomer: customerAuthService.canUseDemoCustomer(),
    isConfigured: customerAuthService.isConfigured(),
    logout,
    refresh: () => initialize(true),
    sendOtp,
    verifyOtp,
  };
}
