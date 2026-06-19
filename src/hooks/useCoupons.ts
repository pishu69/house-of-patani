import { useQuery } from "@tanstack/react-query";

import { couponService } from "@/services";

export const couponQueryKeys = {
  all: ["coupons"] as const,
};

export function useCoupons() {
  return useQuery({
    queryKey: couponQueryKeys.all,
    queryFn: () => couponService.list(),
    staleTime: 5 * 60 * 1000,
  });
}
