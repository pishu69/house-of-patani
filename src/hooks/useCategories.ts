import { useQuery } from "@tanstack/react-query";

import { categoryService } from "@/services";

export const categoryQueryKeys = {
  all: ["categories"] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryQueryKeys.all,
    queryFn: () => categoryService.list(),
    staleTime: 10 * 60 * 1000,
  });
}
