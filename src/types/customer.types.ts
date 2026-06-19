import type { Address } from "@/types/address.types";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses?: Address[];
}
