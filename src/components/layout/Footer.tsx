import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import {
  SocialLinks,
  type SocialLink,
} from "@/components/common/SocialLinks";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

const socialLinks: SocialLink[] = [
  { href: "/", label: "Instagram", platform: "instagram" },
  { href: "/", label: "Facebook", platform: "facebook" },
  { href: "/", label: "Twitter", platform: "twitter" },
];

export function Footer() {
  return (
    <footer
      className="border-t border-maroon/10 bg-charcoal text-ivory"
      id="footer"
    >
      <div className="section-shell grid gap-10 py-12 sm:py-14 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.9fr_1.1fr]">
        <div>
          <h2 className="font-serif text-3xl text-ivory">House of Patani</h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-ivory/70">
            Tradition Woven with Heritage. A refined home for Indian craft,
            heirloom textiles, thoughtful objects, and stories that last.
          </p>
          <SocialLinks className="mt-6" links={socialLinks} tone="inverse" />
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
            Quick Links
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-ivory/75">
            <li>
              <Link className="transition hover:text-gold" to={ROUTES.SHOP}>
                Shop
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-gold" to={ROUTES.ABOUT}>
                About
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-gold" to={ROUTES.CONTACT}>
                Contact
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-gold" to={ROUTES.CART}>
                Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
            Contact
          </h3>
          <ul className="mt-5 space-y-4 text-sm text-ivory/75">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 shrink-0 text-gold" size={17} />
              Patani Heritage House, India
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 shrink-0 text-gold" size={17} />
              care@houseofpatani.com
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 shrink-0 text-gold" size={17} />
              +91 98765 43210
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
            Newsletter
          </h3>
          <p className="mt-5 text-sm leading-7 text-ivory/70">
            Receive craft stories, collection notes, and seasonal edits.
          </p>
          <form className="mt-5 flex flex-col gap-3">
            <label className="sr-only" htmlFor="footer-email">
              Email address
            </label>
            <input
              className="h-12 rounded-full border border-ivory/15 bg-ivory/10 px-4 text-sm text-ivory placeholder:text-ivory/45"
              id="footer-email"
              placeholder="Email address"
              type="email"
            />
            <Button className="bg-gold text-charcoal hover:bg-gold/90">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t border-ivory/10 py-5 text-center text-xs uppercase tracking-[0.22em] text-ivory/55">
        Copyright 2026 House of Patani
      </div>
    </footer>
  );
}
