import { motion } from "framer-motion";
import { useSettings } from "@/hooks";
import { createImageSrcSet } from "@/utils/image";

const ARTISAN_IMAGE = "/images/about/artisan.jpg";

const artisanValues = [
  {
    title: "Textile Lineages",
    description:
      "Block printing, stitching, weaving, and dyeing with generational memory.",
  },
  {
    title: "Material Honesty",
    description:
      "Cotton, brass, rosewood, paper, and natural textures shown with restraint.",
  },
  {
    title: "Slow Presentation",
    description:
      "A calmer shopping rhythm built around meaning instead of urgency.",
  },
  {
    title: "Community First",
    description:
      "A premium visual language that still honors the maker behind each object.",
  },
] as const;

export function ArtisanSection() {
  const settingsQuery = useSettings();
  const settings = settingsQuery.data?.data;

  return (
    <section className="bg-maroon py-7 text-ivory sm:py-10 lg:py-12">
      <div className="section-shell grid items-start gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:gap-7">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              {settings?.artisanEyebrow ?? "Artisan Community"}
            </p>
            <h2 className="mt-2.5 text-3xl leading-tight text-ivory sm:text-4xl lg:text-5xl">
              {settings?.artisanTitle ?? "Crafted by hands that know patience."}
            </h2>
            <p className="mt-2.5 max-w-xl text-base leading-6 text-ivory/72">
              {settings?.artisanDescription ??
                "The visual language keeps the maker close: honest materials, measured pacing, and space for every detail to breathe."}
            </p>
          </motion.div>

          <motion.div
            className="mt-4 overflow-hidden rounded-lg border border-ivory/15"
            initial={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.25 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <img
              alt="Artisan craft materials arranged in a warm workshop"
              className="aspect-[4/3] w-full object-cover"
              decoding="async"
              loading="lazy"
              sizes="(min-width: 1024px) 42vw, 100vw"
              src={ARTISAN_IMAGE}
              srcSet={createImageSrcSet(ARTISAN_IMAGE)}
            />
          </motion.div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {artisanValues.map((value, index) => (
            <motion.article
              className="rounded-lg border border-ivory/15 bg-ivory/8 p-4 backdrop-blur-sm sm:min-h-36"
              initial={{ opacity: 0, y: 18 }}
              key={value.title}
              transition={{
                delay: index * 0.06,
                duration: 0.5,
                ease: "easeOut",
              }}
              viewport={{ once: true, amount: 0.2 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl text-ivory sm:text-2xl">{value.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-ivory/72">
                {value.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
