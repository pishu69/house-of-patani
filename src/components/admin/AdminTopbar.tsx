import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Avatar } from "@/components/common/Avatar";
import { IconButton } from "@/components/common/IconButton";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

interface AdminTopbarProps {
  onOpenMenu: () => void;
}

export function AdminTopbar({ onOpenMenu }: AdminTopbarProps) {
  const navigate = useNavigate();
  const { logout, session, status } = useAuth();
  const adminName = session?.admin.name ?? "Store Manager";
  const adminEmail = session?.admin.email ?? "Store operations";
  const initials = adminName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  async function handleLogout() {
    try {
      await logout();
      navigate(ROUTES.ADMIN.LOGIN_PATH, { replace: true });
    } catch (error) {
      toast.error("You could not be signed out.", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-maroon/10 bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <IconButton
          aria-label="Open admin menu"
          className="lg:hidden"
          onClick={onOpenMenu}
          size="sm"
        >
          <Menu aria-hidden="true" size={20} />
        </IconButton>
        <p className="hidden text-sm font-medium text-charcoal sm:block">
          Store administration
        </p>
        <p className="font-serif text-lg text-charcoal sm:hidden">Admin</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-charcoal">{adminName}</p>
          <p className="max-w-56 truncate text-xs text-muted-foreground">
            {adminEmail}
          </p>
        </div>
        <Avatar alt={adminName} fallback={initials} size="sm" />
        <IconButton
          aria-label="Sign out of administration"
          disabled={status === "loading"}
          onClick={() => void handleLogout()}
          size="sm"
          title="Sign out"
        >
          <LogOut aria-hidden="true" size={18} />
        </IconButton>
      </div>
    </header>
  );
}
