import { CheckCircle2, KeyRound, LogIn, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { useCustomerAuth } from "@/hooks";

export function CustomerSignInPlaceholder() {
  const { session, status } = useCustomerAuth();
  const isAuthenticated = status === "authenticated";

  return (
    <section className="flex flex-col gap-4 border-b border-maroon/10 bg-linen/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-maroon/10 text-maroon">
          {isAuthenticated ? (
            <CheckCircle2 aria-hidden="true" size={19} />
          ) : (
            <KeyRound aria-hidden="true" size={19} />
          )}
        </span>
        <div>
          <p className="font-semibold text-charcoal">
            {isAuthenticated
              ? `Verified mobile ${session?.phone ?? ""}`
              : "Sign in to connect your account"}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {isAuthenticated
              ? "Guest orders, saved addresses, and wishlist pieces are connected to your customer account."
              : "Verify your mobile with a one-time password to connect guest orders, addresses, and saved pieces."}
          </p>
        </div>
      </div>
      <Link
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-maroon/25 px-4 text-sm font-semibold text-maroon transition hover:bg-maroon/5"
        to={isAuthenticated ? ROUTES.ORDER_LOOKUP : ROUTES.LOGIN}
      >
        {isAuthenticated ? (
          <Search aria-hidden="true" size={16} />
        ) : (
          <LogIn aria-hidden="true" size={16} />
        )}
        {isAuthenticated ? "Find a guest order" : "Login with mobile"}
      </Link>
    </section>
  );
}
