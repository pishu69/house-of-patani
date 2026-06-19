import { motion } from "framer-motion";

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
  return (
    <section className="bg-maroon py-16 text-ivory sm:py-20 lg:py-24">
      <div className="section-shell grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              Artisan Community
            </p>
            <h2 className="mt-4 text-3xl leading-tight text-ivory sm:text-4xl md:text-5xl lg:text-6xl">
              Crafted by hands that know patience.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-ivory/72">
              The visual language keeps the maker close: honest materials,
              measured pacing, and space for every detail to breathe.
            </p>
          </motion.div>

          <motion.div
            className="mt-8 overflow-hidden rounded-lg border border-ivory/15"
            initial={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.25 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <img
              alt="Artisan craft materials arranged in a warm workshop"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
              src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1100&q=85"
            />
          </motion.div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {artisanValues.map((value, index) => (
            <motion.article
              className="rounded-lg border border-ivory/15 bg-ivory/8 p-6 backdrop-blur-sm sm:min-h-52"
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
              <h3 className="text-2xl text-ivory">{value.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ivory/72">
                {value.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
