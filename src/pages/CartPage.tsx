import { Link } from "react-router-dom";
import { EmptyCartState } from "@/components/cart/EmptyCartState";
import { PageHero } from "@/components/common/PageHero";
import { ROUTES } from "@/constants/routes";

export function CartPage() {
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
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-maroon px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lift transition hover:bg-maroon/90"
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
