import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CartItem } from "@/components/cart/CartItem";
import { EmptyCartState } from "@/components/cart/EmptyCartState";
import { Divider } from "@/components/common/Divider";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/useCart";
import { showCartMutationToast } from "@/lib/cart-feedback";
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
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1">
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
              showCartMutationToast(product.name, result);
            }}
            onRemove={() => {
              const result = removeItem(product.id);
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
      <div className="sticky bottom-0 bg-background pt-5">
        <Divider />
        <div className="flex items-center justify-between py-5">
          <span className="font-serif text-2xl">Subtotal</span>
          <span className="text-lg font-semibold text-maroon">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
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
