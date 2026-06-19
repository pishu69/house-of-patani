import { motion } from "framer-motion";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-maroon/10 bg-linen/70 py-14 sm:py-20">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="section-shell max-w-4xl text-center"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl md:text-7xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {description}
        </p>
      </motion.div>
    </section>
  );
}
