import { useQuery } from "@tanstack/react-query";

import { productQueryKeys } from "@/hooks/useProducts";
import { productService } from "@/services";

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: productQueryKeys.bySlug(slug ?? ""),
    queryFn: () => productService.getBySlug(slug ?? ""),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}
