import { FormEvent, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { PageHero } from "@/components/common/PageHero";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/constants/config";
import { useSettings } from "@/hooks";
import { contactService } from "@/services";

export function ContactPage() {
  const settingsQuery = useSettings();
  const settings = settingsQuery.data?.data;
  const [isSending, setIsSending] = useState(false);

  const address = settings?.address || "Patani Heritage House, India";
  const email = APP_CONFIG.CONTACT_EMAIL;
  const phone = settings?.whatsappNumber || "+91 98765 43210";

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const senderEmail = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !senderEmail || !message) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!senderEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setIsSending(true);

      await contactService.create({
        email: senderEmail,
        message,
        name,
      });

      form.reset();

      toast.success("Message sent.", {
        description: "Thank you for contacting House of Patani.",
      });
    } catch (error) {
  console.error(error);
      toast.error("Message could not be sent.", {
        description: "Please try again or email us directly.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <PageHero
        description="A composed contact experience for customer care, collection inquiries, and artisan partnerships."
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
                {address}
              </p>
              <p className="flex gap-3">
                <Mail className="shrink-0 text-gold" size={19} />
                <a className="hover:text-maroon" href={`mailto:${email}`}>
                  {email}
                </a>
              </p>
              <p className="flex gap-3">
                <Phone className="shrink-0 text-gold" size={19} />
                {phone}
              </p>
            </div>
          </aside>

          <form
            className="rounded-lg border border-maroon/10 bg-card p-8 shadow-lift"
            onSubmit={submitContact}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" htmlFor="name">
                  Name
                </label>
                <input
                  className="mt-2 h-12 w-full rounded-full border border-maroon/15 bg-background px-4"
                  id="name"
                  name="name"
                  required
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
                  name="email"
                  required
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
                name="message"
                required
              />
            </div>
            <Button className="mt-6" disabled={isSending} type="submit">
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}

