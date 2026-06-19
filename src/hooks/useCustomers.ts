import { useQuery } from "@tanstack/react-query";

import { customerService } from "@/services";

export const customerQueryKeys = {
  all: ["customers"] as const,
};

export function useCustomers() {
  return useQuery({
    queryKey: customerQueryKeys.all,
    queryFn: () => customerService.list(),
    staleTime: 5 * 60 * 1000,
  });
}
