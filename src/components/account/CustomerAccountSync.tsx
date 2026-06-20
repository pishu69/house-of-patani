import { useEffect } from "react";

import { useCustomerAuth } from "@/hooks";
import { customerAccountService } from "@/services";
import { useCustomerStore } from "@/stores/customer.store";
import { useWishlistStore } from "@/stores/wishlist.store";

export function CustomerAccountSync() {
  const { session, status } = useCustomerAuth();
  const addresses = useCustomerStore((state) => state.addresses);
  const profile = useCustomerStore((state) => state.profile);
  const wishlistProductIds = useWishlistStore((state) => state.productIds);

  useEffect(() => {
    if (status !== "authenticated" || session?.isDemo) return undefined;

    const timer = window.setTimeout(() => {
      void customerAccountService.syncAuthenticatedAccount().catch(() => {
        // Local state remains authoritative until the next successful sync.
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [addresses, profile, session?.isDemo, status, wishlistProductIds]);

  return null;
}
