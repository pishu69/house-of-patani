import { Search, ShoppingBag, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export interface MobileMenuItem {
  label: string;
  to: string;
}

interface MobileMenuProps {
  cartCount?: number;
  id?: string;
  isOpen: boolean;
  items: readonly MobileMenuItem[];
  onCartOpen?: () => void;
  onNavigate: () => void;
}

export function MobileMenu({
  cartCount = 0,
  id = "mobile-navigation",
  isOpen,
  items,
  onCartOpen,
  onNavigate,
}: MobileMenuProps) {
  return (
    <div
      className={cn(
        "grid border-t border-maroon/10 bg-ivory transition-all duration-300 lg:hidden",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <nav
        aria-label="Mobile navigation"
        className="overflow-hidden"
        id={id}
      >
        <ul className="section-shell flex flex-col gap-1 py-4">
          {items.map((item) => (
            <li key={item.label}>
              <Link
                className="block rounded-full px-4 py-3 text-sm font-semibold text-charcoal transition hover:bg-maroon/5 hover:text-maroon"
                onClick={onNavigate}
                to={item.to}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="grid grid-cols-3 gap-2 pt-3">
            <Link
              aria-label="Search"
              className="flex justify-center rounded-full border border-maroon/15 py-3 text-maroon transition hover:bg-maroon/5"
              onClick={onNavigate}
              to={ROUTES.SHOP}
            >
              <Search aria-hidden="true" size={19} />
            </Link>
            <button
              aria-label={`Open cart with ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              className="relative flex justify-center rounded-full border border-maroon/15 py-3 text-maroon transition hover:bg-maroon/5"
              onClick={onCartOpen}
              type="button"
            >
              <ShoppingBag aria-hidden="true" size={19} />
              {cartCount > 0 ? (
                <span className="absolute right-3 top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-maroon px-1 text-[0.65rem] font-bold text-ivory">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </button>
            <Link
              aria-label="Account"
              className="flex justify-center rounded-full border border-maroon/15 py-3 text-maroon transition hover:bg-maroon/5"
              onClick={onNavigate}
              to={ROUTES.ABOUT}
            >
              <UserRound aria-hidden="true" size={19} />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
