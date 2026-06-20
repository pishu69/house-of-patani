import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Categories", to: `${ROUTES.HOME}#categories` },
  { label: "Shop", to: ROUTES.SHOP },
  { label: "About", to: ROUTES.ABOUT },
  { label: "Contact", to: ROUTES.CONTACT },
] as const;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-maroon/10 bg-ivory/90 backdrop-blur-xl">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-card focus:px-4 focus:py-2"
        href="#main-content"
      >
        Skip to content
      </a>
      <div className="section-shell flex h-20 items-center justify-between gap-3">
        <Link
          aria-label="House of Patani home"
          className="group min-w-0 leading-none"
          to={ROUTES.HOME}
        >
          <span className="block truncate font-serif text-xl text-maroon transition group-hover:text-charcoal sm:text-2xl">
            House of Patani
          </span>
          <span className="mt-1 hidden text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-gold sm:block lg:tracking-[0.3em]">
            Tradition Woven with Heritage
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      "text-sm font-medium text-charcoal/75 transition hover:text-maroon",
                      isActive && "text-maroon",
                    )
                  }
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            aria-label="Search"
            className="rounded-full p-3 text-charcoal/75 transition hover:bg-maroon/5 hover:text-maroon"
            to={ROUTES.SHOP}
          >
            <Search size={20} />
          </Link>
          <button
            aria-label={`Open cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative rounded-full p-3 text-charcoal/75 transition hover:bg-maroon/5 hover:text-maroon"
            onClick={openDrawer}
            type="button"
          >
            <ShoppingBag aria-hidden="true" size={20} />
            {itemCount > 0 ? (
              <span className="absolute right-0 top-0 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-maroon px-1 text-[0.65rem] font-bold text-ivory">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </button>
          <AccountMenu />
        </div>

        <button
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="shrink-0 rounded-full border border-maroon/15 p-3 text-maroon transition hover:bg-maroon/5 lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <MobileMenu
        cartCount={itemCount}
        isOpen={isOpen}
        items={navItems}
        onCartOpen={() => {
          setIsOpen(false);
          openDrawer();
        }}
        onNavigate={() => setIsOpen(false)}
      />
    </header>
  );
}
