import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { IconButton } from "@/components/common/IconButton";

interface ShopFilterDrawerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onReset?: () => void;
}

export function ShopFilterDrawer({
  children,
  isOpen,
  onClose,
  onReset,
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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    drawerRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button
        aria-label="Close filters"
        className="absolute inset-0 bg-charcoal/35 backdrop-blur-[1px]"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-label="Product filters"
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 flex max-h-[82dvh] animate-in flex-col rounded-t-[1.5rem] border border-maroon/10 bg-background p-4 shadow-elegant slide-in-from-bottom-8 duration-300"
        ref={drawerRef}
        role="dialog"
        tabIndex={-1}
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-maroon/20"
        />
        <div className="flex shrink-0 items-center justify-between gap-4">
          <h2 className="text-3xl">Filters</h2>
          <IconButton aria-label="Close filters" onClick={onClose}>
            <X aria-hidden="true" size={20} />
          </IconButton>
        </div>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-0.5 pb-5">
          {children}
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-maroon/10 bg-background pt-3">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-maroon/25 px-4 text-sm font-semibold text-maroon transition hover:bg-maroon/5"
            onClick={onReset}
            type="button"
          >
            Clear
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-maroon px-4 text-sm font-semibold text-ivory shadow-lift transition hover:bg-maroon/90"
            onClick={onClose}
            type="button"
          >
            Apply
          </button>
        </div>
      </aside>
    </div>
  );
}
