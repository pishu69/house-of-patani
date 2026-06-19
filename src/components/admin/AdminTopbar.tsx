import { Menu } from "lucide-react";

import { Avatar } from "@/components/common/Avatar";
import { IconButton } from "@/components/common/IconButton";

interface AdminTopbarProps {
  onOpenMenu: () => void;
}

export function AdminTopbar({ onOpenMenu }: AdminTopbarProps) {
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
          <p className="text-sm font-semibold text-charcoal">Store Manager</p>
          <p className="text-xs text-muted-foreground">Store operations</p>
        </div>
        <Avatar alt="Store manager" fallback="SM" size="sm" />
      </div>
    </header>
  );
}
