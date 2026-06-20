import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/services";

export const orderConfirmationQueryKeys = {
  byNumber: (orderNumber: string) =>
    ["order-confirmation", orderNumber] as const,
};

export function useOrderConfirmation(orderNumber: string | undefined) {
  return useQuery({
    enabled: Boolean(orderNumber),
    queryFn: () => orderService.getByOrderNumber(orderNumber ?? ""),
    queryKey: orderConfirmationQueryKeys.byNumber(orderNumber ?? ""),
    staleTime: 10 * 60 * 1000,
  });
}
