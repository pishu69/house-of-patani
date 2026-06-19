import { X } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "@/components/common/IconButton";
import { cn } from "@/lib/utils";

interface CartDrawerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
}

export function CartDrawer({
  children,
  isOpen,
  onClose,
  title = "Your Cart",
}: CartDrawerProps) {
  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        "fixed inset-0 z-[70] transition",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <button
        aria-label="Close cart"
        className={cn(
          "absolute inset-0 bg-charcoal/45 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        type="button"
      />
      <aside
        aria-label={title}
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background p-6 shadow-elegant transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl">{title}</h2>
          <IconButton aria-label="Close cart" onClick={onClose}>
            <X aria-hidden="true" size={20} />
          </IconButton>
        </div>
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}
