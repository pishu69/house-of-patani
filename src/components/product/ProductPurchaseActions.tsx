import { CreditCard, Heart, Share2, ShoppingBag } from "lucide-react";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductPurchaseActionsProps {
  isWishlisted: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onQuantityChange: (quantity: number) => void;
  onShare: () => void;
  onStockLimit: () => void;
  onWishlistToggle: () => void;
  quantity: number;
  stock: number;
}

export function ProductPurchaseActions({
  isWishlisted,
  onAddToCart,
  onBuyNow,
  onQuantityChange,
  onShare,
  onStockLimit,
  onWishlistToggle,
  quantity,
  stock,
}: ProductPurchaseActionsProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-charcoal">Quantity</p>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <QuantitySelector
            max={Math.max(stock, 1)}
            onChange={onQuantityChange}
            onMaximumReached={onStockLimit}
            quantity={quantity}
          />
          <div className="flex items-center gap-2">
            <button
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className="inline-flex min-h-10 items-center gap-1 px-0.5 text-[11px] font-semibold text-maroon transition duration-200 hover:-translate-y-0.5 hover:text-maroon/75 min-[360px]:text-xs sm:px-1.5 sm:text-sm"
              onClick={onWishlistToggle}
              type="button"
            >
              <Heart
                aria-hidden="true"
                className={cn(isWishlisted && "fill-maroon")}
                size={17}
              />
              <span>Wishlist</span>
            </button>
            <button
              className="inline-flex min-h-10 items-center gap-1 px-0.5 text-[11px] font-semibold text-maroon transition duration-200 hover:-translate-y-0.5 hover:text-maroon/75 min-[360px]:text-xs sm:px-1.5 sm:text-sm"
              onClick={onShare}
              type="button"
            >
              <Share2 aria-hidden="true" size={16} />
              Share
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            className="px-3 text-sm sm:px-5 sm:text-base"
            disabled={stock === 0}
            fullWidth
            onClick={onAddToCart}
            size="lg"
            variant="outline"
          >
            <ShoppingBag aria-hidden="true" size={18} />
            {stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
          <Button
            className="px-3 text-sm sm:px-5 sm:text-base"
            disabled={stock === 0}
            fullWidth
            onClick={onBuyNow}
            size="lg"
          >
            <CreditCard aria-hidden="true" size={18} />
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
