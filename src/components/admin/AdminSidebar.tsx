import { ExternalLink, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { adminNavigation } from "@/components/admin/admin-navigation";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { logout, session, status } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      onNavigate?.();
      navigate(ROUTES.ADMIN.LOGIN_PATH, { replace: true });
    } catch (error) {
      toast.error("You could not be signed out.", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  return (
    <div className="flex h-full flex-col bg-maroon text-ivory">
      <div className="border-b border-ivory/10 px-6 py-6">
        <p className="font-serif text-2xl leading-none text-ivory">
          House of Patani
        </p>
        <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold">
          Administration
        </p>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 px-3 py-5">
        <ul className="space-y-1">
          {adminNavigation.map(({ icon: Icon, label, to }) => (
            <li key={to}>
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-ivory/70 transition",
                    "hover:bg-ivory/10 hover:text-ivory",
                    isActive && "bg-ivory/12 text-ivory shadow-sm",
                  )
                }
                end={to === "/admin"}
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

      <div className="border-t border-ivory/10 p-3">
        <div className="mb-2 px-3 py-2 lg:hidden">
          <p className="truncate text-sm font-semibold text-ivory">
            {session?.admin.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-ivory/55">
            {session?.admin.email}
          </p>
        </div>
        <NavLink
          className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-ivory/70 transition hover:bg-ivory/10 hover:text-ivory"
          onClick={onNavigate}
          to="/"
        >
          <ExternalLink aria-hidden="true" size={18} />
          View storefront
        </NavLink>
        <button
          className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-ivory/70 transition hover:bg-ivory/10 hover:text-ivory disabled:opacity-50"
          disabled={status === "loading"}
          onClick={() => void handleLogout()}
          type="button"
        >
          <LogOut aria-hidden="true" size={18} />
          Sign out
        </button>
      </div>
    </div>
  );
}
