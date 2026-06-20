import { LoaderCircle, Smartphone } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import { CustomerAuthShell } from "@/components/account/CustomerAuthShell";
import { FormFieldError } from "@/components/admin/FormFieldError";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useCustomerAuth } from "@/hooks";
import {
  customerLoginSchema,
  type CustomerLoginFormValues,
} from "@/lib/customer-auth-schemas";
import { applyZodErrors } from "@/lib/form-validation";

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    canUseDemoCustomer,
    error: authError,
    isConfigured,
    sendOtp,
    status,
  } = useCustomerAuth();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<CustomerLoginFormValues>({
    defaultValues: { phone: "" },
  });
  const destination =
    (location.state as LoginLocationState | null)?.from ??
    ROUTES.ACCOUNT.ROOT;

  useEffect(() => {
    if (status === "authenticated") {
      navigate(destination, { replace: true });
    }
  }, [destination, navigate, status]);

  async function submit(values: CustomerLoginFormValues) {
    const result = customerLoginSchema.safeParse(values);
    if (!result.success) {
      applyZodErrors(result.error.issues, setError);
      return;
    }
    try {
      const response = await sendOtp({ phone: result.data.phone });
      navigate(ROUTES.VERIFY_OTP, {
        state: {
          cooldownSeconds: response.cooldownSeconds,
          demoOtp: response.demoOtp,
          from: destination,
        },
      });
    } catch {
      // The auth store exposes the user-friendly error.
    }
  }

  const isLoading = status === "loading";
  const unavailable = !isConfigured && !canUseDemoCustomer;

  return (
    <CustomerAuthShell
      description="Enter the Indian mobile number used for your orders. We will send a one-time password to verify it."
      eyebrow="Mobile sign in"
      title="Welcome back"
    >
      {canUseDemoCustomer ? (
        <div className="mt-6 rounded-md border border-gold/40 bg-gold/10 p-4 text-xs leading-6 text-charcoal">
          <p className="font-semibold">
            Demo Customer Mode - not connected to MSG91
          </p>
          <p className="mt-1">Use OTP 123456 during local development.</p>
        </div>
      ) : null}
      {unavailable || authError ? (
        <div
          className="mt-6 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          {unavailable ? "OTP login is not configured yet." : authError}
        </div>
      ) : null}
      <form
        className="mt-6 space-y-5"
        noValidate
        onSubmit={handleSubmit(submit)}
      >
        <label className="block text-sm font-semibold text-charcoal">
          Mobile number
          <div className="mt-2 flex h-12 overflow-hidden rounded-md border border-maroon/15 bg-background focus-within:ring-2 focus-within:ring-maroon">
            <span className="flex items-center border-r border-maroon/10 px-3 text-sm text-muted-foreground">
              +91
            </span>
            <input
              autoComplete="tel"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm font-normal text-charcoal outline-none"
              disabled={isLoading || unavailable}
              inputMode="numeric"
              maxLength={10}
              placeholder="98765 43210"
              {...register("phone")}
            />
          </div>
          <FormFieldError message={errors.phone?.message} />
        </label>
        <Button
          disabled={isLoading || unavailable}
          fullWidth
          size="lg"
          type="submit"
        >
          {isLoading ? (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin"
              size={18}
            />
          ) : (
            <Smartphone aria-hidden="true" size={18} />
          )}
          {isLoading ? "Sending OTP..." : "Send secure OTP"}
        </Button>
      </form>
      <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
        Guest checkout and secure order lookup remain available without
        signing in.
      </p>
    </CustomerAuthShell>
  );
}
