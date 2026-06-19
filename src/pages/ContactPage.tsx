import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/common/PageHero";
import { Button } from "@/components/ui/button";

export function ContactPage() {
  return (
    <>
      <PageHero
        description="A composed contact experience for future customer care, collection inquiries, and artisan partnerships."
        eyebrow="Contact"
        title="We would love to hear from you"
      />
      <section className="bg-background py-16">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-lg border border-maroon/10 bg-card p-8 shadow-lift">
            <h2 className="text-4xl">House Details</h2>
            <div className="mt-8 space-y-5 text-sm text-muted-foreground">
              <p className="flex gap-3">
                <MapPin className="shrink-0 text-gold" size={19} />
                Patani Heritage House, India
              </p>
              <p className="flex gap-3">
                <Mail className="shrink-0 text-gold" size={19} />
                care@houseofpatani.com
              </p>
              <p className="flex gap-3">
                <Phone className="shrink-0 text-gold" size={19} />
                +91 98765 43210
              </p>
            </div>
          </aside>

          <form className="rounded-lg border border-maroon/10 bg-card p-8 shadow-lift">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" htmlFor="name">
                  Name
                </label>
                <input
                  className="mt-2 h-12 w-full rounded-full border border-maroon/15 bg-background px-4"
                  id="name"
                  type="text"
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="email">
                  Email
                </label>
                <input
                  className="mt-2 h-12 w-full rounded-full border border-maroon/15 bg-background px-4"
                  id="email"
                  type="email"
                />
              </div>
            </div>
            <div className="mt-5">
              <label className="text-sm font-semibold" htmlFor="message">
                Message
              </label>
              <textarea
                className="mt-2 min-h-40 w-full rounded-2xl border border-maroon/15 bg-background p-4"
                id="message"
              />
            </div>
            <Button className="mt-6">Send Message</Button>
          </form>
        </div>
      </section>
    </>
  );
}
