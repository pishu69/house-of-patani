import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { createImageSrcSet } from "@/utils/image";

interface StorySectionProps {
  action?: ReactNode;
  compact?: boolean;
  description: ReactNode;
  eyebrow: string;
  imageAlt: string;
  imagePosition?: "left" | "right";
  imageUrl: string;
  title: string;
}

export function StorySection({
  action,
  compact = false,
  description,
  eyebrow,
  imageAlt,
  imagePosition = "left",
  imageUrl,
  title,
}: StorySectionProps) {
  return (
    <div
      className={cn(
        "section-shell grid items-center lg:grid-cols-2",
        compact ? "gap-6 lg:gap-9" : "gap-10 lg:gap-16",
      )}
    >
      <motion.div
        className={cn(
          "overflow-hidden rounded-lg shadow-elegant",
          imagePosition === "right" && "lg:order-2",
        )}
        initial={{ opacity: 0, x: imagePosition === "left" ? -24 : 24 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.25 }}
        whileInView={{ opacity: 1, x: 0 }}
      >
        <img
          alt={imageAlt}
          className="aspect-[4/5] h-full w-full object-cover"
          decoding="async"
          loading="lazy"
          sizes="(min-width: 1024px) 50vw, 100vw"
          src={imageUrl}
          srcSet={createImageSrcSet(imageUrl, [540, 768, 1024, 1280])}
        />
      </motion.div>
      <motion.div
        className={cn(imagePosition === "right" && "lg:order-1")}
        initial={{ opacity: 0, x: imagePosition === "left" ? 24 : -24 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.25 }}
        whileInView={{ opacity: 1, x: 0 }}
      >
        <p className="eyebrow">{eyebrow}</p>
        <h2
          className={cn(
            "leading-tight",
            compact
              ? "mt-3 text-3xl sm:text-4xl lg:text-5xl"
              : "mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
          )}
        >
          {title}
        </h2>
        <div
          className={cn(
            "text-base text-muted-foreground",
            compact
              ? "mt-3.5 space-y-2.5 leading-7 sm:text-base"
              : "mt-6 space-y-4 leading-8 sm:text-lg",
          )}
        >
          {description}
        </div>
        {action ? <div className={compact ? "mt-5" : "mt-8"}>{action}</div> : null}
      </motion.div>
    </div>
  );
}
