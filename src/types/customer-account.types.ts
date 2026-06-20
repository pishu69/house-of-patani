import type { OrderConfirmation } from "@/types/order.types";

export interface CustomerProfile {
  email: string;
  name: string;
  phone: string;
}

export interface CustomerAddress {
  city: string;
  country: string;
  id: string;
  isDefault: boolean;
  label: string;
  line1: string;
  line2: string;
  postalCode: string;
  state: string;
}

export interface GuestOrderLookupInput {
  contact: string;
  orderNumber: string;
}

export interface CustomerAccountSnapshot {
  addresses: CustomerAddress[];
  profile: CustomerProfile;
}

export type GuestOrderLookupResult = OrderConfirmation | null;
