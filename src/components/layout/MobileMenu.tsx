import { LogOut, Search, ShoppingBag, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import { useCustomerAuth } from "@/hooks";
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
  const navigate = useNavigate();
  const { logout, status } = useCustomerAuth();
  const isAuthenticated = status === "authenticated";

  async function handleLogout() {
    try {
      await logout();
      onNavigate();
      navigate(ROUTES.HOME);
      toast.success("You are signed out.");
    } catch {
      toast.error("You could not be signed out.");
    }
  }

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
              to={isAuthenticated ? ROUTES.ACCOUNT.ROOT : ROUTES.LOGIN}
            >
              <UserRound aria-hidden="true" size={19} />
            </Link>
          </li>
          <li className="grid gap-1 border-t border-maroon/10 pt-3">
            {isAuthenticated ? (
              <>
                <Link
                  className="rounded-full px-4 py-3 text-sm font-semibold text-charcoal transition hover:bg-maroon/5 hover:text-maroon"
                  onClick={onNavigate}
                  to={ROUTES.ACCOUNT.ORDERS_PATH}
                >
                  My Orders
                </Link>
                <Link
                  className="rounded-full px-4 py-3 text-sm font-semibold text-charcoal transition hover:bg-maroon/5 hover:text-maroon"
                  onClick={onNavigate}
                  to={ROUTES.ACCOUNT.WISHLIST_PATH}
                >
                  Wishlist
                </Link>
                <button
                  className="rounded-full px-4 py-3 text-left text-sm font-semibold text-charcoal transition hover:bg-maroon/5 hover:text-maroon"
                  onClick={() => void handleLogout()}
                  type="button"
                >
                  <LogOut className="mr-2 inline" size={16} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                className="rounded-full px-4 py-3 text-sm font-semibold text-charcoal transition hover:bg-maroon/5 hover:text-maroon"
                onClick={onNavigate}
                to={ROUTES.LOGIN}
              >
                Login
              </Link>
            )}
            <Link
              className="rounded-full px-4 py-3 text-sm font-semibold text-charcoal transition hover:bg-maroon/5 hover:text-maroon"
              onClick={onNavigate}
              to={ROUTES.ORDER_LOOKUP}
            >
              Order Lookup
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
