import { PageHero } from "@/components/common/PageHero";

export function CheckoutPage() {
  return (
    <>
      <PageHero
        description="A considered final step for delivery details, order review, and payment."
        eyebrow="Checkout"
        title="A calm path to completion"
      />
      <section className="bg-background py-16">
        <div className="section-shell grid gap-6 lg:grid-cols-3">
          {["Information", "Delivery", "Payment"].map((step, index) => (
            <article
              className="rounded-lg border border-maroon/10 bg-card p-8 shadow-lift"
              key={step}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-sm font-semibold text-maroon">
                {index + 1}
              </span>
              <h2 className="mt-5 text-3xl">{step}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Review this part of your order in a clear, composed sequence.
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
