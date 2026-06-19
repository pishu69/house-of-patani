import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { IconButton } from "@/components/common/IconButton";

interface ShopFilterDrawerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function ShopFilterDrawer({
  children,
  isOpen,
  onClose,
}: ShopFilterDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    drawerRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] lg:hidden"
    >
      <button
        aria-label="Close filters"
        className="absolute inset-0 bg-charcoal/45"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-label="Product filters"
        aria-modal="true"
        className="absolute bottom-0 left-0 top-0 w-[min(24rem,90vw)] overflow-y-auto bg-background p-5 shadow-elegant"
        ref={drawerRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl">Filters</h2>
          <IconButton aria-label="Close filters" onClick={onClose}>
            <X aria-hidden="true" size={20} />
          </IconButton>
        </div>
        <div className="mt-6">{children}</div>
      </aside>
    </div>
  );
}
