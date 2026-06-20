import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { IconButton } from "@/components/common/IconButton";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useWishlist } from "@/hooks";
import { showCartMutationToast } from "@/lib/cart-feedback";
import { useCartStore } from "@/stores/cart.store";
import { formatCurrency } from "@/utils";

export function WishlistPage() {
  const wishlist = useWishlist();
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);

  if (wishlist.isLoading) return <Loading />;

  if (wishlist.items.length === 0) {
    return (
      <div>
        <p className="eyebrow">Wishlist</p>
        <h2 className="mt-2 text-3xl">Saved pieces</h2>
        <div className="mt-7">
          <EmptyState
            action={
              <Link to={ROUTES.SHOP}>
                <Button>Explore the collection</Button>
              </Link>
            }
            description="Use the heart on any product to keep it close for later."
            icon={Heart}
            title="Your wishlist is empty"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Wishlist</p>
      <h2 className="mt-2 text-3xl">Saved pieces</h2>
      <div className="mt-7 space-y-4">
        {wishlist.items.map((product) => (
          <article
            className="flex flex-col gap-4 rounded-lg border border-maroon/10 bg-background p-4 sm:flex-row sm:items-center"
            key={product.id}
          >
            <Link
              className="aspect-[4/3] w-full overflow-hidden rounded-md bg-linen sm:h-24 sm:w-20 sm:shrink-0"
              to={`/product/${product.slug}`}
            >
              {product.images[0] ? (
                <img
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  src={product.images[0]}
                />
              ) : null}
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/product/${product.slug}`}>
                <h3 className="text-xl">{product.name}</h3>
              </Link>
              <p className="mt-1 font-semibold text-maroon">
                {formatCurrency(product.price)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {product.stock === 0
                  ? "Out of stock"
                  : `${product.stock} available`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                disabled={product.stock === 0}
                onClick={() => {
                  const result = addItem(product.id);
                  showCartMutationToast(product.name, result);
                  if (result.success) {
                    wishlist.remove(product.id);
                    openDrawer();
                    toast.success("Moved from wishlist to cart.");
                  }
                }}
                size="sm"
              >
                <ShoppingBag aria-hidden="true" size={16} />
                Move to cart
              </Button>
              <IconButton
                aria-label={`Remove ${product.name} from wishlist`}
                onClick={() => {
                  wishlist.remove(product.id);
                  toast.success("Removed from wishlist.");
                }}
                variant="outline"
              >
                <Trash2 aria-hidden="true" size={17} />
              </IconButton>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
