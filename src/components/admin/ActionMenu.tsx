import { MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ActionMenuItem {
  destructive?: boolean;
  icon?: LucideIcon;
  label: string;
  onSelect?: () => void;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  label?: string;
}

export function ActionMenu({
  items,
  label = "Open actions",
}: ActionMenuProps) {
  return (
    <details className="relative">
      <summary
        aria-label={label}
        className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full text-charcoal transition hover:bg-maroon/5"
      >
        <MoreHorizontal aria-hidden="true" size={19} />
      </summary>
      <div className="absolute right-0 z-20 mt-2 min-w-44 rounded-md border border-maroon/10 bg-card p-1 shadow-elegant">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={
                item.destructive
                  ? "flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-destructive transition hover:bg-destructive/5"
                  : "flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-charcoal transition hover:bg-maroon/5"
              }
              key={item.label}
              onClick={item.onSelect}
              type="button"
            >
              {Icon ? <Icon aria-hidden="true" size={16} /> : null}
              {item.label}
            </button>
          );
        })}
      </div>
    </details>
  );
}
