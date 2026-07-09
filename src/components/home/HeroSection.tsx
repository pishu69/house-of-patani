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
  const settings = settingsQuery.data?.data;
  const heroImage = settingsQuery.isLoading
  ? ""
  : settings?.homepageBanner || DEFAULT_HERO_IMAGE;
  const heroSubtitle = settings?.heroSubtitle || "Tradition Woven with Heritage";
  const heroTitle = settings?.heroTitle || "House of Patani";
  const heroDescription =
    settings?.heroDescription ||
    "A refined marketplace for Indian craft, handwoven textiles, carved keepsakes, and objects that carry the warmth of home.";
  const heroQuote = settings?.heroQuote || "Hand-selected craft, softened by time.";

  return (
    <section className="relative flex min-h-[min(680px,calc(76svh-4rem))] items-end overflow-hidden bg-ivory sm:min-h-[calc(82svh-5rem)] lg:min-h-[calc(86svh-5rem)]">
      {heroImage ? (
        <img
        alt="Handcrafted heritage textile in warm maroon and gold tones"
        className="absolute inset-0 h-full w-full object-cover object-[66%_center] sm:object-[68%_center] md:object-[60%_center] lg:object-center"
        decoding="async"
        fetchPriority="high"
        loading="eager"
        sizes="100vw"
        src={heroImage}
        srcSet={createImageSrcSet(heroImage, [768, 1280, 1800, 2200])}
        />
      ) : null}
      <div className={heroImage ? "absolute inset-0 bg-charcoal/60" : "absolute inset-0 bg-ivory"} />

      <div className="section-shell relative z-10 py-9 sm:py-14 lg:py-[4.5rem]">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="max-w-[19rem] text-[11px] font-semibold uppercase leading-5 tracking-[0.24em] text-gold sm:max-w-none sm:text-xs sm:tracking-[0.28em]">
            {heroSubtitle}
          </p>
          <h1 className="mt-3 max-w-4xl text-5xl leading-[0.95] text-ivory sm:mt-4 sm:text-6xl md:text-7xl lg:text-8xl">
            {heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-ivory/82 sm:mt-5 sm:text-lg sm:leading-8">
            {heroDescription}
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
            <Link
              className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ivory px-5 py-2 text-sm font-semibold text-maroon shadow-lift transition duration-300 hover:bg-gold hover:text-charcoal sm:min-w-40"
              to={ROUTES.SHOP}
            >
              Shop Collection
              <ArrowRight
                className="transition group-hover:translate-x-1"
                size={18}
              />
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-ivory/40 px-5 py-2 text-sm font-semibold text-ivory transition hover:border-ivory hover:bg-ivory/10 sm:min-w-36"
              to={ROUTES.ABOUT}
            >
              Our Heritage
            </Link>
          </div>
          <p className="mt-6 max-w-xl border-l border-gold/70 pl-4 font-serif text-lg leading-7 text-ivory/85 sm:mt-8 sm:text-2xl">
            {heroQuote}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

