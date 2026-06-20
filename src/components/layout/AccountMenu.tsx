import {
  Heart,
  PackageSearch,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

const accountLinks = [
  { icon: UserRound, label: "Account", to: ROUTES.ACCOUNT.ROOT },
  { icon: PackageSearch, label: "My Orders", to: ROUTES.ACCOUNT.ORDERS_PATH },
  { icon: Heart, label: "Wishlist", to: ROUTES.ACCOUNT.WISHLIST_PATH },
  { icon: Search, label: "Order Lookup", to: ROUTES.ORDER_LOOKUP },
] as const;

export function AccountMenu() {
  return (
    <details className="group relative">
      <summary
        aria-label="Open account menu"
        className="flex cursor-pointer list-none rounded-full p-3 text-charcoal/75 transition hover:bg-maroon/5 hover:text-maroon"
      >
        <UserRound aria-hidden="true" size={20} />
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-56 rounded-lg border border-maroon/10 bg-card p-2 shadow-elegant">
        {accountLinks.map(({ icon: Icon, label, to }) => (
          <Link
            className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-charcoal/75 transition hover:bg-maroon/5 hover:text-maroon"
            key={to}
            onClick={(event) =>
              event.currentTarget.closest("details")?.removeAttribute("open")
            }
            to={to}
          >
            <Icon aria-hidden="true" size={16} />
            {label}
          </Link>
        ))}
        <div className="my-1 border-t border-maroon/10" />
        <Link
          className="flex min-h-9 items-center gap-3 rounded-md px-3 text-xs text-muted-foreground transition hover:bg-maroon/5 hover:text-maroon"
          onClick={(event) =>
            event.currentTarget.closest("details")?.removeAttribute("open")
          }
          to={ROUTES.ADMIN.LOGIN_PATH}
        >
          <ShieldCheck aria-hidden="true" size={15} />
          Store administration
        </Link>
      </div>
    </details>
  );
}
