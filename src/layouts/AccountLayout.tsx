import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import { AccountSidebar } from "@/components/account/AccountSidebar";
import { CustomerSignInPlaceholder } from "@/components/account/CustomerSignInPlaceholder";
import { IconButton } from "@/components/common/IconButton";
import { useCustomerStore } from "@/stores/customer.store";

export function AccountLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const name = useCustomerStore((state) => state.profile.name);

  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="section-shell">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Your account</p>
            <h1 className="mt-2 text-4xl sm:text-5xl">
              {name ? `Welcome, ${name.split(" ")[0]}` : "A place for your orders"}
            </h1>
          </div>
          <IconButton
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close account menu" : "Open account menu"}
            className="md:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            variant="outline"
          >
            {isMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </IconButton>
        </header>

        <div className="overflow-hidden rounded-lg border border-maroon/10 bg-card shadow-lift">
          <CustomerSignInPlaceholder />
          <div className="grid md:grid-cols-[14rem_minmax(0,1fr)]">
            <aside
              className={`border-b border-maroon/10 p-4 md:block md:border-b-0 md:border-r md:p-5 ${
                isMenuOpen ? "block" : "hidden"
              }`}
            >
              <AccountSidebar onNavigate={() => setIsMenuOpen(false)} />
            </aside>
            <div className="min-w-0 p-5 sm:p-7 lg:p-9">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
