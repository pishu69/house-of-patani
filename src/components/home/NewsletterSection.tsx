import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { newsletterService } from "@/services";
import { createImageSrcSet } from "@/utils/image";

const NEWSLETTER_IMAGE =
  "https://drlphuhxfplgctkjoucs.supabase.co/storage/v1/object/public/banner-images/newsletter/ChatGPT%20Image%20Jun%2029,%202026,%2005_31_37%20AM.png";

export function NewsletterSection() {
  const [isSubscribing, setIsSubscribing] = useState(false);

  async function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();

    try {
      setIsSubscribing(true);
      await newsletterService.subscribe(email);
      form.reset();

      toast.success("Subscribed successfully.", {
        description: "You will now receive Patani Letters.",
      });
    } catch (error) {
      toast.error("Could not subscribe.", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again after some time.",
      });
    } finally {
      setIsSubscribing(false);
    }
  }

  return (
    <section className="bg-linen/75 py-7 sm:py-10 lg:py-11">
      <div className="section-shell">
        <div className="grid overflow-hidden rounded-lg border border-maroon/10 bg-card shadow-elegant lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-h-48 sm:min-h-52">
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
          <div className="flex flex-col justify-center p-4 sm:p-6 lg:p-7">
            <p className="eyebrow">Patani Letters</p>
            <h2 className="mt-2.5 text-3xl leading-tight sm:text-4xl md:text-[2.5rem]">
              Receive the quiet luxury of craft in your inbox.
            </h2>
            <p className="mt-2 text-base leading-6 text-muted-foreground">
              Seasonal edits, artisan stories, and collection notes from House
              of Patani.
            </p>
            <form
              className="mt-4 flex flex-col gap-2.5 sm:flex-row"
              onSubmit={submitNewsletter}
            >
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
                  name="email"
                  placeholder="Email address"
                  required
                  type="email"
                />
              </div>
              <Button disabled={isSubscribing} type="submit">
                {isSubscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
