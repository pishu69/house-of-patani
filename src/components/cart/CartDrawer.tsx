import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { IconButton } from "@/components/common/IconButton";

interface CartDrawerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function CartDrawer({
  children,
  isOpen,
  onClose,
  title = "Your Cart",
}: CartDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab" && drawerRef.current) {
        const focusable = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!first || !last) {
          return;
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    drawerRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        aria-label="Close cart"
        className="absolute inset-0 bg-charcoal/35 backdrop-blur-[1px] md:bg-charcoal/45 md:backdrop-blur-0"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-label={title}
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 flex h-[min(78vh,calc(100dvh-2rem))] w-full animate-in slide-in-from-bottom-8 duration-300 flex-col rounded-t-[1.5rem] border border-maroon/10 bg-background p-4 shadow-elegant sm:p-5 md:inset-x-auto md:bottom-auto md:right-0 md:top-0 md:h-full md:min-w-[24rem] md:max-w-md md:animate-in md:slide-in-from-right-8 md:rounded-none md:border-y-0 md:border-l md:border-r-0 md:p-6"
        ref={drawerRef}
        role="dialog"
        tabIndex={-1}
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-maroon/20 md:hidden"
        />
        <div className="flex shrink-0 items-center justify-between gap-4">
          <h2 className="text-3xl">{title}</h2>
          <IconButton aria-label="Close cart" onClick={onClose}>
            <X aria-hidden="true" size={20} />
          </IconButton>
        </div>
        <div className="mt-4 min-h-0 flex-1 overflow-hidden md:mt-5">
          {children}
        </div>
      </aside>
    </div>
  );
}
