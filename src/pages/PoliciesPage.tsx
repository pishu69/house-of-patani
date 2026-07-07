import { Mail } from "lucide-react";

import { PageHero } from "@/components/common/PageHero";
import { Card } from "@/components/common/Card";
import { APP_CONFIG } from "@/constants/config";

const policySections = [
  {
    title: "Shipping Policy",
    items: [
      "Orders are packed with care and usually dispatched within 2-4 business days.",
      "Delivery timelines may vary by destination, courier availability, and public holidays.",
      "Shipping charges, if any, are shown before order confirmation.",
    ],
  },
  {
    title: "Return Policy",
    items: [
      "Return requests must be raised within 3 days after delivery.",
      "Items must be unused, unwashed, undamaged, and in their original packaging.",
      "Return approval is subject to product condition verification.",
      "Books, customized items, final sale items, and used products are not returnable unless a damaged or wrong item was received.",
    ],
  },
  {
    title: "Refund Policy",
    items: [
      "Refunds are processed only after the returned product is received and inspected.",
      "Approved refunds are issued to the original payment method where possible.",
      "COD charges, shipping charges, and payment gateway charges may be non-refundable where applicable.",
    ],
  },
  {
    title: "Cancellation Policy",
    items: [
      "Cancellation requests can be reviewed before dispatch.",
      "Once an order is packed or dispatched, cancellation may not be possible.",
      "If a prepaid order is cancelled before dispatch, eligible refunds will follow the refund policy.",
    ],
  },
  {
    title: "Terms & Conditions",
    items: [
      "Product colors and textures may vary slightly because of screen settings and handcrafted finishes.",
      "Prices, availability, and offers may change without prior notice.",
      "By placing an order, customers agree to provide accurate contact, delivery, and payment information.",
    ],
  },
  {
    title: "Privacy Policy",
    items: [
      "Customer information is used to process orders, provide support, and improve the shopping experience.",
      "House of Patani does not sell customer personal information.",
      "Payment information is handled through secure payment partners and is not stored by House of Patani.",
    ],
  },
];

export function PoliciesPage() {
  return (
    <>
      <PageHero
        description="Clear, customer-friendly policies for shipping, returns, refunds, cancellations, privacy, and support."
        eyebrow="Customer Care"
        title="House of Patani Policies"
      />

      <section className="bg-background py-12 sm:py-16">
        <div className="section-shell space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            {policySections.map((section) => (
              <Card className="p-5 sm:p-6" key={section.title}>
                <h2 className="text-2xl text-charcoal">{section.title}</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                  {section.items.map((item) => (
                    <li className="flex gap-3" key={item}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">Contact / Support</p>
                <h2 className="mt-2 text-2xl text-charcoal">
                  Need help with an order?
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  For return requests, damaged or wrong item reports, refunds,
                  shipping updates, or policy questions, email our support team.
                </p>
              </div>
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-maroon px-5 text-sm font-semibold text-ivory transition hover:bg-maroon/90"
                href={`mailto:${APP_CONFIG.CONTACT_EMAIL}`}
              >
                <Mail aria-hidden="true" size={17} />
                {APP_CONFIG.CONTACT_EMAIL}
              </a>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
