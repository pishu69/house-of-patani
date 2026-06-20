import { LoaderCircle, LockKeyhole, Store } from "lucide-react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

function AdminAccessLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div
        className="flex flex-col items-center text-center"
        role="status"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-maroon/10 text-maroon">
          <LoaderCircle
            aria-hidden="true"
            className="animate-spin"
            size={25}
          />
        </span>
        <h1 className="mt-5 text-3xl">Verifying administrator access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Securing the House of Patani workspace.
        </p>
      </div>
    </main>
  );
}

function AdminAccessDenied() {
  const { error, logout } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-lg rounded-lg border border-maroon/10 bg-card p-7 text-center shadow-lift sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <LockKeyhole aria-hidden="true" size={26} />
        </span>
        <p className="eyebrow mt-5">Restricted area</p>
        <h1 className="mt-2 text-4xl">Administrator access required</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">
          {error ??
            "This signed-in account is not listed as an active House of Patani administrator."}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            onClick={() => void logout()}
            type="button"
            variant="outline"
          >
            Sign out
          </Button>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-maroon px-5 text-sm font-semibold text-ivory"
            to={ROUTES.HOME}
          >
            <Store aria-hidden="true" size={17} />
            Return to store
          </Link>
        </div>
      </section>
    </main>
  );
}

export function AdminRouteGuard() {
  const location = useLocation();
  const { status } = useAuth();

  if (status === "idle" || status === "loading") {
    return <AdminAccessLoading />;
  }

  if (status === "unauthenticated") {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to={ROUTES.ADMIN.LOGIN_PATH}
      />
    );
  }

  if (status === "denied") {
    return <AdminAccessDenied />;
  }

  return <Outlet />;
}
