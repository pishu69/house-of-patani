import { supabase } from "@/lib/supabase";
import type {
  CreateInventoryItemInput,
  InventoryItem,
  InventoryMovement,
  ManualStockAdjustmentInput,
  PurchaseEntryInput,
  SyncProductInventoryInput,
} from "@/types/inventory";

function mapInventoryMovement(row: any): InventoryMovement {
  return {
    id: row.id,
    inventoryItemId: row.inventory_item_id,
    productId: row.product_id,
    movementType: row.movement_type,
    quantity: Number(row.quantity ?? 0),
    previousQuantity: Number(row.previous_quantity ?? 0),
    newQuantity: Number(row.new_quantity ?? 0),
    reason: row.reason ?? null,
    referenceType: row.reference_type ?? null,
    referenceId: row.reference_id ?? null,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
  };
}

function mapInventoryItem(row: any): InventoryItem {
  const stockQuantity = Number(row.stock_quantity ?? 0);
  const reservedQuantity = Number(row.reserved_quantity ?? 0);
  const availableQuantity = Math.max(stockQuantity - reservedQuantity, 0);
  const lowStockThreshold = Number(row.low_stock_threshold ?? 5);

  let status: InventoryItem["status"] = "in_stock";

  if (availableQuantity <= 0) {
    status = "out_of_stock";
  } else if (availableQuantity <= lowStockThreshold) {
    status = "low_stock";
  }

  return {
    id: row.id,
    productId: row.product_id,
    sku: row.sku,
    stockQuantity,
    reservedQuantity,
    availableQuantity,
    lowStockThreshold,
    allowBackorder: Boolean(row.allow_backorder),
    trackInventory: Boolean(row.track_inventory),
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function syncProductStock(productId: string, stockQuantity: number) {
  if (!supabase) return;

  const { error } = await supabase
    .from("products")
    .update({
      stock: Math.max(stockQuantity, 0),
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) throw error;
}

export const inventoryService = {
  async list(): Promise<InventoryItem[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapInventoryItem);
  },

  async listMovements(limit = 50): Promise<InventoryMovement[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("inventory_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data ?? []).map(mapInventoryMovement);
  },

  async getByProductId(productId: string): Promise<InventoryItem | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("product_id", productId)
      .maybeSingle();

    if (error) throw error;

    return data ? mapInventoryItem(data) : null;
  },

  async create(input: CreateInventoryItemInput): Promise<InventoryItem> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase
      .from("inventory_items")
      .insert({
        product_id: input.productId,
        sku: input.sku,
        stock_quantity: input.stockQuantity,
        reserved_quantity: 0,
        low_stock_threshold: input.lowStockThreshold,
        allow_backorder: input.allowBackorder ?? false,
        track_inventory: input.trackInventory ?? true,
      })
      .select("*")
      .single();

    if (error) throw error;

    await syncProductStock(input.productId, input.stockQuantity);

    return mapInventoryItem(data);
  },

  async syncProductInventory(
    input: SyncProductInventoryInput,
  ): Promise<InventoryItem> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const existing = await this.getByProductId(input.productId);

    if (!existing) {
      return this.create({
        productId: input.productId,
        sku: input.sku,
        stockQuantity: input.stockQuantity,
        lowStockThreshold: input.lowStockThreshold,
        allowBackorder: input.allowBackorder,
        trackInventory: input.trackInventory,
      });
    }

    const { data, error } = await supabase
      .from("inventory_items")
      .update({
        sku: input.sku,
        stock_quantity: input.stockQuantity,
        low_stock_threshold: input.lowStockThreshold,
        allow_backorder: input.allowBackorder,
        track_inventory: input.trackInventory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;

    await syncProductStock(input.productId, input.stockQuantity);

    return mapInventoryItem(data);
  },

  async manualAdjustment(input: ManualStockAdjustmentInput): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data: item, error: itemError } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("id", input.inventoryItemId)
      .single();

    if (itemError) throw itemError;

    const previousQuantity = Number(item.stock_quantity ?? 0);
    const newQuantity = Math.max(previousQuantity + input.quantity, 0);

    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({
        stock_quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.inventoryItemId);

    if (updateError) throw updateError;

    await syncProductStock(String(item.product_id), newQuantity);

    const { error: movementError } = await supabase
      .from("inventory_movements")
      .insert({
        inventory_item_id: item.id,
        product_id: item.product_id,
        movement_type: "manual_adjustment",
        quantity: input.quantity,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        reason: input.reason,
        reference_type: "manual",
      });

    if (movementError) throw movementError;
  },

  async addPurchase(input: PurchaseEntryInput): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data: item, error: itemError } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("id", input.inventoryItemId)
      .single();

    if (itemError) throw itemError;

    const previousQuantity = Number(item.stock_quantity ?? 0);
    const newQuantity = previousQuantity + input.quantity;
    const totalCost =
      typeof input.unitCost === "number" ? input.unitCost * input.quantity : null;

    const { error: purchaseError } = await supabase
      .from("inventory_purchase_entries")
      .insert({
        inventory_item_id: item.id,
        product_id: item.product_id,
        supplier_name: input.supplierName ?? null,
        quantity: input.quantity,
        unit_cost: input.unitCost ?? null,
        total_cost: totalCost,
        purchase_date: input.purchaseDate ?? new Date().toISOString().slice(0, 10),
        notes: input.notes ?? null,
      });

    if (purchaseError) throw purchaseError;

    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({
        stock_quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.inventoryItemId);

    if (updateError) throw updateError;

    await syncProductStock(String(item.product_id), newQuantity);

    const { error: movementError } = await supabase
      .from("inventory_movements")
      .insert({
        inventory_item_id: item.id,
        product_id: item.product_id,
        movement_type: "purchase",
        quantity: input.quantity,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        reason: "Purchase stock added",
        reference_type: "purchase_entry",
      });

    if (movementError) throw movementError;
  },
};