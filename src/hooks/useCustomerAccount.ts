import { useQuery } from "@tanstack/react-query";

import { customerAccountService } from "@/services";
import { useCustomerStore } from "@/stores/customer.store";

export const customerOrderQueryKeys = {
  all: (email: string, phone: string) =>
    ["customer-orders", email, phone] as const,
  byNumber: (orderNumber: string, email: string, phone: string) =>
    ["customer-orders", orderNumber, email, phone] as const,
};

export function useCustomerOrders() {
  const profile = useCustomerStore((state) => state.profile);
  const hasContact = Boolean(profile.email || profile.phone);

  return useQuery({
    enabled: hasContact,
    queryFn: () => customerAccountService.listOrders(profile),
    queryKey: customerOrderQueryKeys.all(profile.email, profile.phone),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomerOrder(orderNumber: string | undefined) {
  const profile = useCustomerStore((state) => state.profile);
  const hasContact = Boolean(profile.email || profile.phone);

  return useQuery({
    enabled: Boolean(orderNumber) && hasContact,
    queryFn: () =>
      customerAccountService.getOrder(orderNumber ?? "", profile),
    queryKey: customerOrderQueryKeys.byNumber(
      orderNumber ?? "",
      profile.email,
      profile.phone,
    ),
    staleTime: 5 * 60 * 1000,
  });
}
