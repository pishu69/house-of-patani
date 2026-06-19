import { useQuery } from "@tanstack/react-query";

import { productService } from "@/services";

export const productQueryKeys = {
  all: ["products"] as const,
  bySlug: (slug: string) => ["products", "slug", slug] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productQueryKeys.all,
    queryFn: () => productService.list(),
    staleTime: 5 * 60 * 1000,
  });
}
