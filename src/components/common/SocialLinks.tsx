import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SocialLink {
  href: string;
  label: string;
  platform: "facebook" | "instagram" | "linkedin" | "twitter";
}

interface SocialLinksProps {
  className?: string;
  links: SocialLink[];
  tone?: "default" | "inverse";
}

const icons: Record<SocialLink["platform"], LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
};

export function SocialLinks({
  className,
  links,
  tone = "default",
}: SocialLinksProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {links.map((link) => {
        const Icon = icons[link.platform];

        return (
          <a
            aria-label={link.label}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full border transition",
              tone === "inverse"
                ? "border-ivory/15 text-ivory/75 hover:border-gold hover:text-gold"
                : "border-maroon/20 text-maroon hover:bg-maroon/5",
            )}
            href={link.href}
            key={link.platform}
          >
            <Icon aria-hidden="true" size={16} />
          </a>
        );
      })}
    </div>
  );
}
