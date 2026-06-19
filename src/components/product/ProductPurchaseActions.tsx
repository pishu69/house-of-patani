import { ShoppingBag } from "lucide-react";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { WishlistButton } from "@/components/product/WishlistButton";
import { Button } from "@/components/ui/button";

interface ProductPurchaseActionsProps {
  isWishlisted: boolean;
  onAddToCart: () => void;
  onQuantityChange: (quantity: number) => void;
  onWishlistToggle: () => void;
  quantity: number;
  stock: number;
}

export function ProductPurchaseActions({
  isWishlisted,
  onAddToCart,
  onQuantityChange,
  onWishlistToggle,
  quantity,
  stock,
}: ProductPurchaseActionsProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-charcoal">Quantity</p>
      <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
        <QuantitySelector
          max={Math.max(stock, 1)}
          onChange={onQuantityChange}
          quantity={quantity}
        />
        <Button
          disabled={stock === 0}
          fullWidth
          onClick={onAddToCart}
          size="lg"
        >
          <ShoppingBag aria-hidden="true" size={18} />
          {stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
        <WishlistButton
          active={isWishlisted}
          onToggle={onWishlistToggle}
        />
      </div>
    </div>
  );
}
