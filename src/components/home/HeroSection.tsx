import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useSettings } from "@/hooks";
import { createImageSrcSet } from "@/utils/image";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=88";

export function HeroSection() {
  const settingsQuery = useSettings();
  const heroImage =
    settingsQuery.data?.data.homepageBanner || DEFAULT_HERO_IMAGE;

  return (
    <section className="relative flex min-h-[calc(82svh-5rem)] items-end overflow-hidden bg-charcoal sm:min-h-[calc(86svh-5rem)]">
      <img
        alt="Handcrafted heritage textile in warm maroon and gold tones"
        className="absolute inset-0 h-full w-full object-cover object-center"
        decoding="async"
        fetchPriority="high"
        loading="eager"
        sizes="100vw"
        src={heroImage}
        srcSet={createImageSrcSet(heroImage, [768, 1280, 1800, 2200])}
      />
      <div className="absolute inset-0 bg-charcoal/60" />

      <div className="section-shell relative z-10 py-12 sm:py-16 lg:py-20">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
            Tradition Woven with Heritage
          </p>
          <h1 className="mt-4 text-5xl leading-none text-ivory sm:text-6xl md:text-7xl lg:text-8xl">
            House of Patani
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ivory/80 sm:text-lg sm:leading-8">
            A refined marketplace for Indian craft, handwoven textiles, carved
            keepsakes, and objects that carry the warmth of home.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ivory px-5 py-2 text-sm font-semibold text-maroon shadow-lift transition duration-300 hover:bg-gold hover:text-charcoal"
              to={ROUTES.SHOP}
            >
              Shop Collection
              <ArrowRight
                className="transition group-hover:translate-x-1"
                size={18}
              />
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-ivory/40 px-5 py-2 text-sm font-semibold text-ivory transition hover:border-ivory hover:bg-ivory/10"
              to={ROUTES.ABOUT}
            >
              Our Heritage
            </Link>
          </div>
          <p className="mt-8 max-w-xl border-l border-gold/70 pl-4 font-serif text-xl leading-7 text-ivory/85 sm:text-2xl">
            Hand-selected craft, softened by time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
