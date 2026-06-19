import { toast } from "sonner";
import type { CartMutationResult } from "@/types/cart.types";

export function showCartMutationToast(
  productName: string,
  result: CartMutationResult,
) {
  if (result.success) {
    if (result.reason === "removed") {
      toast.success(`${productName} removed from cart`);
      return;
    }

    toast.success(
      result.reason === "added"
        ? `${productName} added to cart`
        : `${productName} quantity updated`,
      {
        description: `Quantity ${result.quantity}.`,
      },
    );
    return;
  }

  if (result.reason === "out-of-stock") {
    toast.error(`${productName} is out of stock`);
    return;
  }

  if (result.reason === "stock-limit") {
    toast.error("Stock limit reached", {
      description: `Only the available quantity of ${productName} can be added.`,
    });
    return;
  }

  toast.error("Unable to update cart", {
    description: `${productName} could not be found in the catalog.`,
  });
}
