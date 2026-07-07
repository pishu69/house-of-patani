import { useQuery } from "@tanstack/react-query";

import { warehouseService } from "@/services";

export const warehouseQueryKeys = {
  all: ["warehouses"] as const,
};

export function useWarehouses() {
  return useQuery({
    queryKey: warehouseQueryKeys.all,
    queryFn: () => warehouseService.list(),
    staleTime: 60 * 1000,
  });
}
