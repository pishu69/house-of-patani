import { Search, ShoppingBag, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export interface MobileMenuItem {
  label: string;
  to: string;
}

interface MobileMenuProps {
  id?: string;
  isOpen: boolean;
  items: readonly MobileMenuItem[];
  onNavigate: () => void;
}

export function MobileMenu({
  id = "mobile-navigation",
  isOpen,
  items,
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
            {[
              { Icon: Search, label: "Search", to: ROUTES.SHOP },
              { Icon: ShoppingBag, label: "Cart", to: ROUTES.CART },
              { Icon: UserRound, label: "Account", to: ROUTES.ABOUT },
            ].map(({ Icon, label, to }) => (
              <Link
                aria-label={label}
                className="flex justify-center rounded-full border border-maroon/15 py-3 text-maroon transition hover:bg-maroon/5"
                key={label}
                onClick={onNavigate}
                to={to}
              >
                <Icon aria-hidden="true" size={19} />
              </Link>
            ))}
          </li>
        </ul>
      </nav>
    </div>
  );
}
