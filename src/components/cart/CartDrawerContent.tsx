import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CartItem } from "@/components/cart/CartItem";
import { EmptyCartState } from "@/components/cart/EmptyCartState";
import { Divider } from "@/components/common/Divider";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/useCart";
import { showCartMutationToast } from "@/lib/cart-feedback";
import { mapAnalyticsItem, trackRemoveFromCart } from "@/lib/analytics";
import { formatCurrency } from "@/utils";

export function CartDrawerContent() {
  const {
    cartItems,
    closeDrawer,
    removeItem,
    subtotal,
    updateQuantity,
  } = useCart();
  const recentItems = [...cartItems].reverse().slice(0, 4);

  if (cartItems.length === 0) {
    return (
      <div className="flex h-full items-center justify-center overflow-y-auto">
        <EmptyCartState
          action={
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-maroon px-5 text-sm font-semibold text-ivory"
              onClick={closeDrawer}
              to={ROUTES.SHOP}
            >
              Explore the Collection
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-4">
        {recentItems.map(({ lineTotal, product, quantity }) => (
          <CartItem
            item={{
              id: product.id,
              imageUrl: product.images[0],
              lineTotal,
              name: product.name,
              price: product.price,
              quantity,
              slug: product.slug,
              stock: product.stock,
            }}
            key={product.id}
            onQuantityChange={(nextQuantity) => {
              const result = updateQuantity(product.id, nextQuantity);
              if (result.success && nextQuantity < quantity) trackRemoveFromCart(mapAnalyticsItem(product, quantity - nextQuantity), { currency: "INR", value: product.price * (quantity - nextQuantity) });
              showCartMutationToast(product.name, result);
            }}
            onRemove={() => {
              const result = removeItem(product.id);
              if (result.success) trackRemoveFromCart(mapAnalyticsItem(product, quantity), { currency: "INR", value: lineTotal });
              showCartMutationToast(product.name, result);
            }}
            onStockLimit={() =>
              toast.error("Stock limit reached", {
                description: `Only ${product.stock} of ${product.name} are currently available.`,
              })
            }
          />
        ))}
        {cartItems.length > recentItems.length ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            And {cartItems.length - recentItems.length} more item
            {cartItems.length - recentItems.length === 1 ? "" : "s"} in your
            cart.
          </p>
        ) : null}
      </div>
      <div className="shrink-0 bg-background pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-4">
        <Divider />
        <div className="flex items-center justify-between py-4 md:py-5">
          <span className="font-serif text-2xl">Subtotal</span>
          <span className="text-lg font-semibold text-maroon">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:gap-3">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-maroon/15 px-5 text-sm font-semibold text-maroon transition hover:bg-maroon/5 sm:col-span-2"
            onClick={closeDrawer}
            type="button"
          >
            Continue Shopping
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-maroon/25 px-5 text-sm font-semibold text-maroon transition hover:bg-maroon/5"
            onClick={closeDrawer}
            to={ROUTES.CART}
          >
            View Cart
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-maroon px-5 text-sm font-semibold text-ivory transition hover:bg-maroon/90"
            onClick={closeDrawer}
            to={ROUTES.CHECKOUT}
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
