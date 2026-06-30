export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export type InventoryMovementType =
  | "purchase"
  | "manual_adjustment"
  | "order_reserved"
  | "order_released"
  | "order_fulfilled"
  | "return"
  | "damage"
  | "correction";

export interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
  trackInventory: boolean;
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  productId: string;
  movementType: InventoryMovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface InventoryPurchaseEntry {
  id: string;
  inventoryItemId: string;
  productId: string;
  supplierName: string | null;
  quantity: number;
  unitCost: number | null;
  totalCost: number | null;
  purchaseDate: string;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface CreateInventoryItemInput {
  productId: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  allowBackorder?: boolean;
  trackInventory?: boolean;
}

export interface SyncProductInventoryInput {
  productId: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
  trackInventory: boolean;
}

export interface ManualStockAdjustmentInput {
  inventoryItemId: string;
  quantity: number;
  reason: string;
}

export interface PurchaseEntryInput {
  inventoryItemId: string;
  quantity: number;
  supplierName?: string | undefined;
  unitCost?: number | undefined;
  purchaseDate?: string | undefined;
  notes?: string | undefined;
}