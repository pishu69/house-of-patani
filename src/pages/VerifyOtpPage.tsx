import { CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import { CustomerAuthShell } from "@/components/account/CustomerAuthShell";
import { FormFieldError } from "@/components/admin/FormFieldError";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useCustomerAuth } from "@/hooks";
import {
  otpVerificationSchema,
  type OtpVerificationFormValues,
} from "@/lib/customer-auth-schemas";
import { applyZodErrors } from "@/lib/form-validation";
import { useCustomerStore } from "@/stores/customer.store";
import { useWishlistStore } from "@/stores/wishlist.store";

interface VerifyLocationState {
  cooldownSeconds?: number;
  demoOtp?: string;
  from?: string;
}

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as VerifyLocationState | null;
  const {
    error: authError,
    pendingPhone,
    sendOtp,
    status,
    verifyOtp,
  } = useCustomerAuth();
  const profile = useCustomerStore((store) => store.profile);
  const addresses = useCustomerStore((store) => store.addresses);
  const wishlistProductIds = useWishlistStore((store) => store.productIds);
  const [seconds, setSeconds] = useState(state?.cooldownSeconds ?? 30);
  const [isVerified, setIsVerified] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<OtpVerificationFormValues>({
    defaultValues: { otp: state?.demoOtp ?? "" },
  });
  const destination = state?.from ?? ROUTES.ACCOUNT.ROOT;

  useEffect(() => {
    if (!pendingPhone) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [navigate, pendingPhone]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setInterval(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [seconds]);

  async function submit(values: OtpVerificationFormValues) {
    const result = otpVerificationSchema.safeParse(values);
    if (!result.success) {
      applyZodErrors(result.error.issues, setError);
      return;
    }
    const resolution = await verifyOtp({
      addresses,
      email: profile.email,
      name: profile.name,
      otp: result.data.otp,
      phone: pendingPhone,
      wishlistProductIds,
    });
    if (resolution.status === "authenticated") {
      setIsVerified(true);
      window.setTimeout(() => navigate(destination, { replace: true }), 650);
    }
  }

  async function resend() {
    try {
      const result = await sendOtp({ phone: pendingPhone, resend: true });
      setSeconds(result.cooldownSeconds);
    } catch {
      // The auth store exposes the user-friendly error.
    }
  }

  const isLoading = status === "loading";
  const maskedPhone = pendingPhone
    ? `${pendingPhone.slice(0, 3)} ****** ${pendingPhone.slice(-2)}`
    : "";

  return (
    <CustomerAuthShell
      description={`Enter the one-time password sent to ${maskedPhone}.`}
      eyebrow="Verify mobile"
      title={isVerified ? "Mobile verified" : "Enter your OTP"}
    >
      {isVerified ? (
        <div
          className="mt-7 flex flex-col items-center rounded-md bg-emerald-700/8 p-6 text-center text-emerald-800"
          role="status"
        >
          <CheckCircle2 aria-hidden="true" size={32} />
          <p className="mt-3 font-semibold">Opening your account...</p>
        </div>
      ) : (
        <>
          {authError ? (
            <div
              className="mt-6 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
              role="alert"
            >
              {authError}
            </div>
          ) : null}
          <form
            className="mt-6 space-y-5"
            noValidate
            onSubmit={handleSubmit(submit)}
          >
            <label className="block text-sm font-semibold text-charcoal">
              One-time password
              <input
                autoComplete="one-time-code"
                className="mt-2 h-14 w-full rounded-md border border-maroon/15 bg-background px-4 text-center font-serif text-2xl text-charcoal"
                disabled={isLoading}
                inputMode="numeric"
                maxLength={9}
                {...register("otp")}
              />
              <FormFieldError message={errors.otp?.message} />
            </label>
            <Button disabled={isLoading} fullWidth size="lg" type="submit">
              {isLoading ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={18}
                />
              ) : (
                <CheckCircle2 aria-hidden="true" size={18} />
              )}
              {isLoading ? "Verifying OTP..." : "Verify and continue"}
            </Button>
          </form>
          <div className="mt-5 flex items-center justify-between gap-4 text-sm">
            <button
              className="font-semibold text-maroon disabled:text-muted-foreground"
              disabled={seconds > 0 || isLoading}
              onClick={() => void resend()}
              type="button"
            >
              <RotateCcw className="mr-1 inline" size={14} />
              Resend OTP
            </button>
            <span aria-live="polite" className="text-muted-foreground">
              {seconds > 0 ? `Available in ${seconds}s` : "Ready to resend"}
            </span>
          </div>
        </>
      )}
    </CustomerAuthShell>
  );
}
