import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

import {
  SocialLinks,
  type SocialLink,
} from "@/components/common/SocialLinks";
import { APP_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { useSettings } from "@/hooks";

export function Footer() {
  const settingsQuery = useSettings();
  const settings = settingsQuery.data?.data;

  const storeName = settings?.storeName || "House of Patani";
  const address = settings?.address || "Kochbehar, India";
  const email = APP_CONFIG.CONTACT_EMAIL;
  const phone = settings?.whatsappNumber || "+91 8290366530";

  const socialLinks: SocialLink[] = [
    ...(settings?.instagram
      ? [{ href: settings.instagram, label: "Instagram", platform: "instagram" as const }]
      : []),
    ...(settings?.facebook
      ? [{ href: settings.facebook, label: "Facebook", platform: "facebook" as const }]
      : []),
  ];

  return (
    <footer
      className="border-t border-maroon/10 bg-charcoal text-ivory"
      id="footer"
    >
      <div className="section-shell grid gap-7 py-9 sm:gap-10 sm:py-14 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.9fr]">
        <div className="border-b border-ivory/10 pb-6 sm:border-b-0 sm:pb-0">
          <h2 className="font-serif text-3xl text-ivory">{storeName}</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ivory/70 sm:mt-4 sm:leading-7">
            Tradition Woven with Heritage. A refined home for craft,
            heirloom textiles, thoughtful objects, and stories that last.
          </p>
          {socialLinks.length > 0 ? (
            <SocialLinks className="mt-4 sm:mt-6" links={socialLinks} tone="inverse" />
          ) : null}
        </div>

        <div className="border-b border-ivory/10 pb-6 sm:border-b-0 sm:pb-0">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
            Quick Links
          </h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-ivory/75 sm:mt-5 sm:block sm:space-y-3">
            <li><Link className="inline-flex min-h-9 items-center transition hover:text-gold sm:min-h-0" to={ROUTES.SHOP}>Shop</Link></li>
            <li><Link className="inline-flex min-h-9 items-center transition hover:text-gold sm:min-h-0" to={ROUTES.ABOUT}>About</Link></li>
            <li><Link className="inline-flex min-h-9 items-center transition hover:text-gold sm:min-h-0" to={ROUTES.CONTACT}>Contact</Link></li>
            <li><Link className="inline-flex min-h-9 items-center transition hover:text-gold sm:min-h-0" to={ROUTES.CART}>Cart</Link></li>
            <li><Link className="inline-flex min-h-9 items-center transition hover:text-gold sm:min-h-0" to={ROUTES.POLICIES}>Policies</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">
            Contact
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/75 sm:mt-5 sm:space-y-4">
            <li className="flex min-h-9 items-center gap-3 sm:min-h-0 sm:items-start">
              <MapPin className="shrink-0 text-gold sm:mt-0.5" size={17} />
              {address}
            </li>
            <li className="flex min-h-9 items-center gap-3 sm:min-h-0 sm:items-start">
              <Mail className="shrink-0 text-gold sm:mt-0.5" size={17} />
              <a className="hover:text-gold" href={`mailto:${email}`}>{email}</a>
            </li>
            <li className="flex min-h-9 items-center gap-3 sm:min-h-0 sm:items-start">
              <Phone className="shrink-0 text-gold sm:mt-0.5" size={17} />
              <a className="hover:text-gold" href={`tel:${phone.replace(/\s/g, "")}`}>
                {phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10 py-5 text-center text-xs uppercase tracking-[0.18em] text-ivory/55 sm:tracking-[0.22em]">
        <p>Copyright 2026 {storeName}</p>
        <div className="mt-3 flex items-center justify-center gap-3 text-[11px] tracking-[0.18em]">
          <Link className="transition hover:text-gold" to={ROUTES.POLICIES}>
            Privacy
          </Link>
          <span aria-hidden="true" className="text-ivory/25">/</span>
          <Link className="transition hover:text-gold" to={ROUTES.POLICIES}>
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
