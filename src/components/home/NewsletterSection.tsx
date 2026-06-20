import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createImageSrcSet } from "@/utils/image";

const NEWSLETTER_IMAGE =
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=85";

export function NewsletterSection() {
  return (
    <section className="bg-linen/75 py-16 sm:py-20 lg:py-24">
      <div className="section-shell">
        <div className="grid overflow-hidden rounded-lg border border-maroon/10 bg-card shadow-elegant lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-h-72">
            <img
              alt="Folded textiles and handcrafted objects in a warm heritage setting"
              className="h-full w-full object-cover"
              decoding="async"
              loading="lazy"
              sizes="(min-width: 1024px) 45vw, 100vw"
              src={NEWSLETTER_IMAGE}
              srcSet={createImageSrcSet(NEWSLETTER_IMAGE)}
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <p className="eyebrow">Patani Letters</p>
            <h2 className="mt-4 text-3xl leading-tight sm:text-4xl md:text-5xl">
              Receive the quiet luxury of craft in your inbox.
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              Seasonal edits, artisan stories, and collection notes from House
              of Patani.
            </p>
            <form className="mt-8 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <div className="relative min-w-0 flex-1">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  className="h-12 w-full rounded-full border border-maroon/15 bg-background px-11 text-sm text-charcoal placeholder:text-muted-foreground"
                  id="newsletter-email"
                  placeholder="Email address"
                  type="email"
                />
              </div>
              <Button>Subscribe</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
