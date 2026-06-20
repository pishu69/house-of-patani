import { KeyRound, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

export function CustomerSignInPlaceholder() {
  return (
    <section className="flex flex-col gap-4 border-b border-maroon/10 bg-linen/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-maroon/10 text-maroon">
          <KeyRound aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="font-semibold text-charcoal">
            Customer sign-in is coming next
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Your profile, addresses, and wishlist are currently saved on this
            device. Mobile OTP will connect them securely in Phase 12.
          </p>
        </div>
      </div>
      <Link
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-maroon/25 px-4 text-sm font-semibold text-maroon transition hover:bg-maroon/5"
        to={ROUTES.ORDER_LOOKUP}
      >
        <Search aria-hidden="true" size={16} />
        Find a guest order
      </Link>
    </section>
  );
}
