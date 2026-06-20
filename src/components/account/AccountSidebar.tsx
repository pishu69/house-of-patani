import { NavLink } from "react-router-dom";

import { accountNavigation } from "@/components/account/account-navigation";
import { cn } from "@/lib/utils";

interface AccountSidebarProps {
  onNavigate?: () => void;
}

export function AccountSidebar({ onNavigate }: AccountSidebarProps) {
  return (
    <nav aria-label="Account navigation">
      <ul className="space-y-1">
        {accountNavigation.map(({ icon: Icon, label, to }) => (
          <li key={to}>
            <NavLink
              className={({ isActive }) =>
                cn(
                  "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-charcoal/70 transition hover:bg-maroon/5 hover:text-maroon",
                  isActive && "bg-maroon/7 text-maroon",
                )
              }
              end={to === "/account"}
              onClick={onNavigate}
              to={to}
            >
              <Icon aria-hidden="true" size={18} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
