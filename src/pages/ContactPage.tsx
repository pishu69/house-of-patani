import { FormEvent, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/constants/config";
import { contactService } from "@/services";

const subjectOptions = [
  "Order Support",
  "Product Inquiry",
  "Collaboration",
  "Wholesale",
  "Community",
  "Other",
];

const faqs = [
  {
    answer:
      "Most orders are dispatched with tracked delivery and usually arrive within 5-8 business days in India.",
    question: "How long does shipping take?",
  },
  {
    answer:
      "After your order is confirmed, you can use your order details to track it from your account or guest order lookup.",
    question: "How do I track my order?",
  },
  {
    answer:
      "We currently serve India only, with international delivery planned for a future phase.",
    question: "Do you deliver outside India?",
  },
  {
    answer:
      "Return eligibility depends on the item and condition. Please review our policies or message us with your order details.",
    question: "How do returns work?",
  },
  {
    answer:
      "We usually reply within one business day, and sooner whenever possible.",
    question: "How quickly do you reply?",
  },
];

export function ContactPage() {
  const [isSending, setIsSending] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const address = "Kochbehar, West Bengal, India";
  const email = APP_CONFIG.CONTACT_EMAIL;
  const phone = "+91 8290366530";

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const senderEmail = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
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
      setHasSubmitted(false);

      await contactService.create({
        email: senderEmail,
        message: subject ? `Subject: ${subject}\n\n${message}` : message,
        name,
      });

      form.reset();
      setHasSubmitted(true);

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
      <section className="border-b border-maroon/10 bg-linen/65 py-8 sm:py-10 lg:py-12">
        <div className="section-shell max-w-3xl">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Questions, suggestions, collaborations, or customer support - we're
            always happy to hear from you.
          </p>
        </div>
      </section>
      <section className="bg-background py-8 sm:py-10 lg:py-12">
        <div className="section-shell grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8">
          <aside className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-7">
            <h2 className="text-3xl">Contact Information</h2>
            <div className="mt-5 grid gap-3.5 text-sm sm:mt-6">
              <div className="flex gap-3 rounded-lg bg-linen/35 p-3">
                <Mail className="mt-1 shrink-0 text-gold" size={18} />
                <div>
                  <p className="font-semibold text-charcoal">Email</p>
                  <a
                    className="mt-1 inline-flex min-h-8 items-center text-muted-foreground transition hover:text-maroon"
                    href={`mailto:${email}`}
                  >
                    {email}
                  </a>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg bg-linen/35 p-3">
                <Phone className="mt-1 shrink-0 text-gold" size={18} />
                <div>
                  <p className="font-semibold text-charcoal">Phone</p>
                  <a
                    className="mt-1 inline-flex min-h-8 items-center text-muted-foreground transition hover:text-maroon"
                    href={`tel:${phone.replace(/\s/g, "")}`}
                  >
                    {phone}
                  </a>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg bg-linen/35 p-3">
                <MapPin className="mt-1 shrink-0 text-gold" size={18} />
                <div>
                  <p className="font-semibold text-charcoal">Location</p>
                  <p className="mt-2 text-muted-foreground">{address}</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg bg-linen/35 p-3">
                <Timer className="mt-1 shrink-0 text-gold" size={18} />
                <div>
                  <p className="font-semibold text-charcoal">Response Time</p>
                  <p className="mt-2 text-muted-foreground">
                    Usually within one business day
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <form
            className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-7"
            onSubmit={submitContact}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" htmlFor="name">
                  Name
                </label>
                <input
                  className="mt-2 h-12 w-full rounded-full border border-maroon/15 bg-background px-4 text-sm transition focus:border-maroon/40 focus:outline-none focus:ring-2 focus:ring-maroon/15"
                  id="name"
                  name="name"
                  placeholder="Your name"
                  required
                  type="text"
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="email">
                  Email
                </label>
                <input
                  className="mt-2 h-12 w-full rounded-full border border-maroon/15 bg-background px-4 text-sm transition focus:border-maroon/40 focus:outline-none focus:ring-2 focus:ring-maroon/15"
                  id="email"
                  name="email"
                  placeholder="Email address"
                  required
                  type="email"
                />
              </div>
            </div>
            <div className="mt-5">
              <label className="text-sm font-semibold" htmlFor="subject">
                Subject
              </label>
              <select
                className="mt-2 h-12 w-full rounded-full border border-maroon/15 bg-background px-4 text-sm transition focus:border-maroon/40 focus:outline-none focus:ring-2 focus:ring-maroon/15"
                defaultValue="Product Inquiry"
                id="subject"
                name="subject"
              >
                {subjectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-5">
              <label className="text-sm font-semibold" htmlFor="message">
                Message
              </label>
              <textarea
                className="mt-2 min-h-36 w-full rounded-2xl border border-maroon/15 bg-background p-4 text-sm transition focus:border-maroon/40 focus:outline-none focus:ring-2 focus:ring-maroon/15"
                id="message"
                name="message"
                placeholder="How can we help you?"
                required
              />
            </div>
            {hasSubmitted ? (
              <div className="mt-5 rounded-lg border border-maroon/10 bg-linen/45 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold text-charcoal">
                  <CheckCircle2
                    aria-hidden="true"
                    className="text-maroon"
                    size={17}
                  />
                  Thank you for reaching out.
                </p>
                <p className="mt-2 text-muted-foreground">
                  We've received your message and will respond as soon as
                  possible.
                </p>
              </div>
            ) : null}
            <Button className="mt-6" disabled={isSending} type="submit">
              {isSending ? (
                "Sending..."
              ) : (
                <>
                  Send Message <ArrowRight aria-hidden="true" size={17} />
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="section-shell mt-8 sm:mt-10">
          <div className="rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-7">
            <h2 className="text-3xl">Frequently Asked Questions</h2>
            <div className="mt-5 divide-y divide-maroon/10">
              {faqs.map((faq) => (
                <details className="group py-3" key={faq.question}>
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-charcoal">
                    {faq.question}
                    <span className="text-lg leading-none text-maroon transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-2 pr-8 text-sm leading-6 text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div className="section-shell mt-8 text-center sm:mt-10">
          <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground">
            Every conversation helps us improve House of Patani and continue
            our mission of preserving Koch Rajbanshi heritage.
          </p>
        </div>
      </section>
    </>
  );
}

