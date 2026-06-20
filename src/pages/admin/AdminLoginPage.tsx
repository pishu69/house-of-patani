import { ArrowLeft, LoaderCircle, LockKeyhole } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { FormFieldError } from "@/components/admin/FormFieldError";
import { Seo } from "@/components/common/Seo";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { applyZodErrors } from "@/lib/form-validation";
import { DEMO_ADMIN_CREDENTIALS } from "@/services/admin-auth.service";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginLocationState {
  from?: string;
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    canUseDemoAdmin,
    error: authError,
    isConfigured,
    login,
    status,
  } = useAuth();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: canUseDemoAdmin ? DEMO_ADMIN_CREDENTIALS.email : "",
      password: canUseDemoAdmin ? DEMO_ADMIN_CREDENTIALS.password : "",
    },
  });
  const destination =
    (location.state as LoginLocationState | null)?.from ?? ROUTES.ADMIN.ROOT;

  useEffect(() => {
    if (status === "authenticated") {
      navigate(destination, { replace: true });
    }
  }, [destination, navigate, status]);

  async function submit(values: LoginFormValues) {
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      applyZodErrors(result.error.issues, setError);
      return;
    }

    const resolution = await login(result.data);
    if (resolution.status === "authenticated") {
      navigate(destination, { replace: true });
    }
  }

  const isLoading = status === "loading";
  const isLoginUnavailable = !isConfigured && !canUseDemoAdmin;

  return (
    <>
      <Seo
        canonicalPath={ROUTES.ADMIN.LOGIN_PATH}
        description="Secure administrator access for House of Patani."
        noIndex
        title="Admin Login"
      />
      <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,0.9fr)_minmax(30rem,1.1fr)]">
      <section className="hidden bg-maroon px-12 py-14 text-ivory lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="font-serif text-3xl text-ivory">House of Patani</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Administration
          </p>
        </div>
        <div className="max-w-lg">
          <p className="eyebrow">Private workspace</p>
          <h1 className="mt-4 text-6xl leading-tight text-ivory">
            Steward the collection with care.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-ivory/70">
            Secure access for the people entrusted with House of Patani
            products, orders, customers, and store operations.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-ivory/50">
          Tradition Woven with Heritage
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-maroon hover:text-maroon/75"
            to={ROUTES.HOME}
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Back to store
          </Link>

          <div className="mt-10 rounded-lg border border-maroon/10 bg-card p-6 shadow-lift sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon/10 text-maroon">
              <LockKeyhole aria-hidden="true" size={23} />
            </span>
            <p className="eyebrow mt-6">Administrator login</p>
            <h2 className="mt-2 text-4xl">Welcome back</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sign in with the administrator account registered in Supabase.
            </p>

            {canUseDemoAdmin ? (
              <div className="mt-6 rounded-md border border-gold/40 bg-gold/10 p-4 text-xs leading-6 text-charcoal">
                <p className="font-semibold">
                  Demo Admin Mode - not connected to Supabase
                </p>
                <p className="mt-1">
                  Development credentials are prefilled for this session.
                </p>
              </div>
            ) : null}

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
                Email
                <input
                  autoComplete="email"
                  className="mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm font-normal text-charcoal"
                  disabled={isLoading || isLoginUnavailable}
                  type="email"
                  {...register("email")}
                />
                <FormFieldError message={errors.email?.message} />
              </label>
              <label className="block text-sm font-semibold text-charcoal">
                Password
                <input
                  autoComplete="current-password"
                  className="mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm font-normal text-charcoal"
                  disabled={isLoading || isLoginUnavailable}
                  type="password"
                  {...register("password")}
                />
                <FormFieldError message={errors.password?.message} />
              </label>
              <Button
                disabled={isLoading || isLoginUnavailable}
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
                  <LockKeyhole aria-hidden="true" size={18} />
                )}
                {isLoading ? "Verifying access..." : "Sign in securely"}
              </Button>
            </form>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
