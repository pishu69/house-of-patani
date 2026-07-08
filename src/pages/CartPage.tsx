import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CouponInput } from "@/components/cart/CouponInput";
import { EmptyCartState } from "@/components/cart/EmptyCartState";
import { ShippingEstimator } from "@/components/cart/ShippingEstimator";
import { shiprocketEstimateStorage } from "@/services/shiprocket.service";
import { PageHero } from "@/components/common/PageHero";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/useCart";
import { showCartMutationToast } from "@/lib/cart-feedback";

export function CartPage() {
  const [country, setCountry] = useState("India");
  const [postalCode, setPostalCode] = useState("");
  const [shiprocketEstimate, setShiprocketEstimate] = useState(() =>
    shiprocketEstimateStorage.get(),
  );
  const {
    cartItems,
    clearCart,
    discount,
    grandTotal,
    removeItem,
    shipping,
    subtotal,
    updateQuantity,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <>
        <PageHero
          description="A calm place to review the pieces you have gathered from the House of Patani collection."
          eyebrow="Cart"
          title="Your selection awaits"
        />
        <section className="bg-background py-16">
          <div className="section-shell">
            <EmptyCartState
              action={
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-maroon px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lift transition hover:bg-maroon/90"
                  to={ROUTES.SHOP}
                >
                  Continue Shopping
                </Link>
              }
            />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        description="Review quantities, estimate delivery, and prepare your selection for checkout."
        eyebrow="Cart"
        title="Your Patani selection"
      />
      <section className="bg-background py-12 sm:py-16">
        <div className="section-shell grid items-start gap-10 lg:grid-cols-[1fr_22rem]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-maroon/10 pb-4">
              <h2 className="text-3xl">Cart Items</h2>
              <Button
                onClick={() => {
                  clearCart();
                  toast.success("Cart cleared");
                }}
                size="sm"
                variant="ghost"
              >
                <Trash2 aria-hidden="true" size={16} />
                Clear Cart
              </Button>
            </div>

            <div>
              {cartItems.map(({ lineTotal, product, quantity }) => (
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
                    variant: product.tags.slice(0, 2).join(" · "),
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
            </div>

            <div className="mt-8 grid gap-8 rounded-lg border border-maroon/10 bg-linen/35 p-5 sm:p-6 md:grid-cols-2">
              
              <ShippingEstimator
                country={country}
                onCountryChange={setCountry}
                onEstimate={() =>
                  toast.info("Shipping estimate noted", {
                    description: postalCode
                      ? `Delivery estimate for ${postalCode} will be confirmed at checkout.`
                      : "Enter a postal code for a more specific estimate.",
                  })
                }
                onPostalCodeChange={setPostalCode}
                postalCode={postalCode}
              />
              {shiprocketEstimate ? (
                <div className="rounded-lg border border-maroon/10 bg-card p-4 text-sm">
                  <h3 className="font-serif text-2xl text-charcoal">
                    Delivery estimate
                  </h3>
                  <div className="mt-3 space-y-2 text-muted-foreground">
                    <p>
                      PIN {shiprocketEstimate.pincode}:{" "}
                      {shiprocketEstimate.serviceable
                        ? "delivery available"
                        : "delivery not available"}
                    </p>
                    <p>
                      Courier: {shiprocketEstimate.courierName || "Not assigned"}
                    </p>
                    <p>
                      COD:{" "}
                      {shiprocketEstimate.codAvailable
                        ? "available"
                        : "not available"}
                    </p>
                    <p>
                      Estimated delivery:{" "}
                      {shiprocketEstimate.estimatedDeliveryDate ||
                        "confirmed after dispatch"}
                    </p>
                  </div>
                  <button
                    className="mt-3 text-xs font-semibold text-maroon underline"
                    onClick={() => setShiprocketEstimate(shiprocketEstimateStorage.get())}
                    type="button"
                  >
                    Refresh saved estimate
                  </button>
                </div>
              ) : null}
            </div>

            <Link
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-maroon/25 px-5 text-sm font-semibold text-maroon transition hover:bg-maroon/5"
              to={ROUTES.SHOP}
            >
              Continue Shopping
            </Link>
          </div>

          <div className="lg:sticky lg:top-28">
            <CartSummary
              action={
                <Link
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-maroon px-6 text-sm font-semibold text-ivory shadow-lift transition hover:bg-maroon/90"
                  to={ROUTES.CHECKOUT}
                >
                  Proceed to Checkout
                </Link>
              }
              discount={discount}
              shipping={shipping}
              subtotal={subtotal}
              total={grandTotal}
            />
            <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
              Taxes and final delivery charges are confirmed at checkout.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

