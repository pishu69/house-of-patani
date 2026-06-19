import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/services";

export const orderQueryKeys = {
  all: ["orders"] as const,
};

export function useOrders() {
  return useQuery({
    queryKey: orderQueryKeys.all,
    queryFn: () => orderService.list(),
    staleTime: 60 * 1000,
  });
}
