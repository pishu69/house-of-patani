import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory.service";
import type {
  CreateInventoryItemInput,
  ManualStockAdjustmentInput,
  PurchaseEntryInput,
} from "@/types/inventory";

export function useInventoryItems() {
  return useQuery({
    queryKey: ["inventory-items"],
    queryFn: inventoryService.list,
  });
}

export function useInventoryMovements(limit = 50) {
  return useQuery({
    queryKey: ["inventory-movements", limit],
    queryFn: () => inventoryService.listMovements(limit),
  });
}
export function useProductInventory(productId: string) {
  return useQuery({
    queryKey: ["inventory-item", productId],
    queryFn: () => inventoryService.getByProductId(productId),
    enabled: Boolean(productId),
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateInventoryItemInput) =>
      inventoryService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
    },
  });
}

export function useManualStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ManualStockAdjustmentInput) =>
      inventoryService.manualAdjustment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
    },
  });
}

export function useAddPurchaseEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PurchaseEntryInput) =>
      inventoryService.addPurchase(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
    },
  });
}