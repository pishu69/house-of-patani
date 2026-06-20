import { useMemo } from "react";

import { useProducts } from "@/hooks/useProducts";
import { useWishlistStore } from "@/stores/wishlist.store";

export function useWishlist() {
  const productIds = useWishlistStore((state) => state.productIds);
  const toggle = useWishlistStore((state) => state.toggle);
  const remove = useWishlistStore((state) => state.remove);
  const productsQuery = useProducts();
  const products = productsQuery.data?.data ?? [];
  const items = useMemo(
    () => products.filter((product) => productIds.includes(product.id)),
    [productIds, products],
  );

  return {
    isLoading: productsQuery.isLoading,
    items,
    productIds,
    remove,
    toggle,
  };
}
