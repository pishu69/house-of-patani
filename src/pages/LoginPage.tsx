import { LoaderCircle, Mail, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { CustomerAuthShell } from "@/components/account/CustomerAuthShell";
import { FormFieldError } from "@/components/admin/FormFieldError";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { useCustomerAuth } from "@/hooks";
import {
  customerLoginSchema,
  type CustomerLoginFormValues,
} from "@/lib/customer-auth-schemas";
import { applyZodErrors } from "@/lib/form-validation";
import { emailAuthService } from "@/services/email-auth.service";

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

  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const phoneOtpEnabled = APP_CONFIG.ENABLE_PHONE_OTP_LOGIN;

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

  async function submitEmail() {
    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error("Enter a valid email address.");
      return;
    }

    try {
      setEmailLoading(true);
      await emailAuthService.sendMagicLink(cleanEmail);
      toast.success("Login link sent.", {
        description: "Please check your email inbox.",
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not send login link.",
      );
    } finally {
      setEmailLoading(false);
    }
  }

  async function continueWithGoogle() {
    try {
      setGoogleLoading(true);
      await emailAuthService.signInWithGoogle();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start Google login.",
      );
      setGoogleLoading(false);
    }
  }

  async function submitPhone(values: CustomerLoginFormValues) {
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
      description="Sign in with your email address or Google account."
      eyebrow="Customer sign in"
      title="Welcome back"
    >
      <div className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-charcoal">
          Email address
          <input
            autoComplete="email"
            className="mt-2 h-12 w-full rounded-md border border-maroon/15 bg-background px-4 text-sm text-charcoal outline-none focus:ring-2 focus:ring-maroon"
            disabled={emailLoading || googleLoading}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
        </label>

        <Button
          disabled={emailLoading || googleLoading}
          fullWidth
          onClick={() => void submitEmail()}
          size="lg"
          type="button"
        >
          {emailLoading ? (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin"
              size={18}
            />
          ) : (
            <Mail aria-hidden="true" size={18} />
          )}
          {emailLoading ? "Sending link..." : "Send login link"}
        </Button>

        <Button
          disabled={emailLoading || googleLoading}
          fullWidth
          onClick={() => void continueWithGoogle()}
          size="lg"
          type="button"
          variant="outline"
        >
          {googleLoading ? (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin"
              size={18}
            />
          ) : null}
          Continue with Google
        </Button>
      </div>

      {phoneOtpEnabled ? (
        <>
          <div className="my-6 border-t border-maroon/10" />

          <button
            className="text-sm font-semibold text-maroon hover:text-gold"
            onClick={() => setShowPhoneOtp((value) => !value)}
            type="button"
          >
            {showPhoneOtp ? "Hide mobile OTP" : "Use mobile OTP instead"}
          </button>

          {showPhoneOtp ? (
            <>
              {canUseDemoCustomer ? (
                <div className="mt-6 rounded-md border border-gold/40 bg-gold/10 p-4 text-xs leading-6 text-charcoal">
                  <p className="font-semibold">
                    Demo Customer Mode - not connected to MSG91
                  </p>
                  <p className="mt-1">
                    Use OTP 123456 during local development.
                  </p>
                </div>
              ) : null}

              {unavailable || authError ? (
                <div
                  className="mt-6 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
                  role="alert"
                >
                  {unavailable
                    ? "Mobile OTP is not available yet."
                    : authError}
                </div>
              ) : null}

              <form
                className="mt-6 space-y-5"
                noValidate
                onSubmit={handleSubmit(submitPhone)}
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
            </>
          ) : null}
        </>
      ) : null}

      <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
        Guest checkout and secure order lookup remain available without signing
        in.
      </p>
    </CustomerAuthShell>
  );
}
