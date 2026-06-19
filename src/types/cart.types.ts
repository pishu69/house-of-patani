import type { CatalogProduct } from "@/types/product.types";

export interface CartEntry {
  productId: string;
  quantity: number;
}

export interface CartItemView {
  lineTotal: number;
  product: CatalogProduct;
  quantity: number;
}

export type CartMutationReason =
  | "added"
  | "updated"
  | "removed"
  | "not-found"
  | "out-of-stock"
  | "stock-limit";

export interface CartMutationResult {
  quantity: number;
  reason: CartMutationReason;
  success: boolean;
}
