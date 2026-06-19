import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { IconButton } from "@/components/common/IconButton";

interface AdminMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminMobileMenu({
  isOpen,
  onClose,
}: AdminMobileMenuProps) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.button
            aria-label="Close admin menu"
            className="absolute inset-0 bg-charcoal/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />
          <motion.aside
            aria-modal="true"
            aria-label="Mobile admin menu"
            className="relative h-full w-[min(19rem,86vw)] shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
          >
            <IconButton
              aria-label="Close admin menu"
              className="absolute right-3 top-3 z-10 text-ivory hover:bg-ivory/10 hover:text-ivory"
              autoFocus
              onClick={onClose}
              size="sm"
            >
              <X aria-hidden="true" size={19} />
            </IconButton>
            <AdminSidebar onNavigate={onClose} />
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
