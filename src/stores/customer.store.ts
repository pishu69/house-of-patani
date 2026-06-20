import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  CustomerAddress,
  CustomerProfile,
} from "@/types/customer-account.types";

interface CustomerStore {
  addresses: CustomerAddress[];
  profile: CustomerProfile;
  addAddress: (address: Omit<CustomerAddress, "id">) => CustomerAddress;
  removeAddress: (id: string) => void;
  replaceAddresses: (addresses: CustomerAddress[]) => void;
  setDefaultAddress: (id: string) => void;
  updateAddress: (
    id: string,
    address: Omit<CustomerAddress, "id">,
  ) => CustomerAddress | null;
  updateProfile: (profile: CustomerProfile) => void;
}

const emptyProfile: CustomerProfile = {
  email: "",
  name: "",
  phone: "",
};

function createAddressId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `address-${crypto.randomUUID()}`
    : `address-${Date.now()}`;
}

function normalizeDefaults(addresses: CustomerAddress[]) {
  if (addresses.length === 0) return addresses;
  if (addresses.some((address) => address.isDefault)) return addresses;
  return addresses.map((address, index) => ({
    ...address,
    isDefault: index === 0,
  }));
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      addresses: [],
      profile: emptyProfile,
      addAddress: (input) => {
        const created = { ...input, id: createAddressId() };
        set((state) => {
          const shouldBeDefault =
            created.isDefault || state.addresses.length === 0;
          return {
            addresses: [
              ...state.addresses.map((address) => ({
                ...address,
                isDefault: shouldBeDefault ? false : address.isDefault,
              })),
              { ...created, isDefault: shouldBeDefault },
            ],
          };
        });
        return created;
      },
      removeAddress: (id) =>
        set((state) => ({
          addresses: normalizeDefaults(
            state.addresses.filter((address) => address.id !== id),
          ),
        })),
      replaceAddresses: (addresses) =>
        set({ addresses: normalizeDefaults(addresses) }),
      setDefaultAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.map((address) => ({
            ...address,
            isDefault: address.id === id,
          })),
        })),
      updateAddress: (id, input) => {
        let updated: CustomerAddress | null = null;
        set((state) => {
          const next = state.addresses.map((address) => {
            if (address.id !== id) {
              return input.isDefault
                ? { ...address, isDefault: false }
                : address;
            }
            updated = { ...input, id };
            return updated;
          });
          return { addresses: normalizeDefaults(next) };
        });
        return updated;
      },
      updateProfile: (profile) => set({ profile }),
    }),
    {
      name: "house-of-patani-customer",
      partialize: (state) => ({
        addresses: state.addresses,
        profile: state.profile,
      }),
      version: 1,
    },
  ),
);
