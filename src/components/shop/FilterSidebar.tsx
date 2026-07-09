import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Divider } from "@/components/common/Divider";
import { Sidebar } from "@/components/layout/Sidebar";

interface FilterSidebarProps {
  children: ReactNode;
  title?: string;
}

export function FilterSidebar({
  children,
  title = "Filters",
}: FilterSidebarProps) {
  return (
    <Sidebar className="space-y-5 bg-card/95" label={title}>
      <div className="flex items-center gap-2 text-maroon">
        <SlidersHorizontal aria-hidden="true" size={18} />
        <h2 className="text-2xl leading-none">{title}</h2>
      </div>
      <Divider />
      {children}
    </Sidebar>
  );
}
