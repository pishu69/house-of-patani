import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  children: ReactNode;
  className?: string;
  label?: string;
}

export function Sidebar({
  children,
  className,
  label = "Sidebar",
}: SidebarProps) {
  return (
    <aside
      aria-label={label}
      className={cn(
        "rounded-lg border border-maroon/10 bg-card p-5 shadow-lift",
        className,
      )}
    >
      {children}
    </aside>
  );
}
