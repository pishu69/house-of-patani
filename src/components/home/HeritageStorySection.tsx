import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const historicalStory = [
  <>
    Patani is more than a piece of clothing. It is a symbol of the{" "}
    <strong className="font-semibold text-maroon">
      history, identity, and cultural heritage
    </strong>{" "}
    of the Koch Rajbanshi people. Although the word still appears in
    historical literature, this centuries-old tradition has gradually become
    rare in everyday life.
  </>,
  <>
    According to Dr. Dipak Kumar Roy, Vice-Chancellor of Raiganj University,
    the traditional attire of the Koch Rajbanshi community represents a unique
    cultural heritage. References to Patani appear in classical works such as{" "}
    <em>Manashakabya</em> by Mankar from the 15th century, including the story
    of Behula and Lakhindar.
  </>,
  <>
    Researchers have documented{" "}
    <strong className="font-semibold text-maroon">
      15 traditional varieties of Patani
    </strong>
    , including Saishyaphuli, Ghuni, Dhala, Dhalakala, Bulukdhala, Maldoi,
    Toroiphuli, Chikonpair, Doraduri, Saada, Ghugupari, Chotapari, Suryapuri,
    Chotari, and Guthaotha.
  </>,
  <>
    Many regional variations also continue across the Koch Rajbanshi homeland,
    reflecting the richness and diversity of our cultural traditions. For
    generations, Patani was worn with pride and passed from one generation to
    the next.
  </>,
  <>
    As lifestyles changed and modernization accelerated, this beautiful
    tradition slowly disappeared from daily use. Along with it, awareness of
    Koch Rajbanshi history, literature, language, and cultural identity also
    began to fade.
  </>,
  <>
    Cooch Behar, once one of the region's most important educational and
    cultural centres, remains home to institutions such as the State Library
    of Cooch Behar, established in 1870. Countless records of our history are
    preserved there, even as many people have become disconnected from this
    remarkable legacy.
  </>,
];

const visionStory = [
  {
    heading: "Fortunately, a new chapter is beginning.",
    paragraphs: [
      "Across India and beyond, young Koch Rajbanshis are rediscovering their roots. Interest in our history, traditional clothing, literature, language, art, and cultural identity is growing stronger than ever.",
    ],
  },
  {
    heading: "That is why we created House of Patani.",
    paragraphs: [
      "Authentic and high-quality cultural products, however, are often difficult to find.",
      "Our vision is to build a single destination where the Koch Rajbanshi community can discover everything connected to its heritage - from traditional Patani and contemporary fashion to books, handicrafts, home decor, artwork, and products that celebrate our identity.",
    ],
  },
  {
    heading: "House of Patani is more than an online store.",
    paragraphs: [
      "It is a commitment to preserving our heritage, supporting our community, and ensuring that the stories, traditions, craftsmanship, and pride of the Koch Rajbanshi people live on for future generations.",
    ],
  },
];

export function HeritageStorySection({ compact = false }: { compact?: boolean }) {
  const history = compact
    ? [historicalStory[0], historicalStory[2], historicalStory[4]]
    : historicalStory;
  return (
    <section className="bg-background py-10 sm:py-14 lg:py-16">
      <div className="section-shell">
        <div className="grid items-center gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          <motion.div
            className="overflow-hidden rounded-lg shadow-elegant"
            initial={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.25 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <img
              alt="Traditional Koch Rajbanshi craft and textiles in a heritage interior"
              className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]"
              decoding="async"
              loading="lazy"
              src="/images/about/heritage.jpg"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.25 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <p className="eyebrow">Our Story</p>
            <h2 className="mt-2.5 text-3xl leading-tight sm:text-4xl lg:text-5xl">
              A living heritage, carried forward.
            </h2>
            <div className="mt-3.5 space-y-2.5 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              {history.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            {compact ? (
              <Link
                className="mt-5 inline-flex min-h-10 items-center rounded-full border border-maroon/25 px-4 text-sm font-semibold text-maroon transition hover:border-maroon hover:bg-maroon/5"
                to={ROUTES.ABOUT}
              >
                Read Full Story
              </Link>
            ) : null}
          </motion.div>
        </div>

        {!compact ? (
          <>
        <div className="my-7 flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-maroon/15" />
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <span className="h-px flex-1 bg-maroon/15" />
        </div>

        <motion.div
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-8 sm:space-y-10">
            {visionStory.map((section, index) => (
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                key={section.heading}
                transition={{
                  delay: index * 0.06,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                viewport={{ once: true, amount: 0.2 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <h3 className="font-serif text-2xl leading-tight text-maroon sm:text-3xl">
                  {section.heading}
                </h3>
                <div className="mt-3 max-w-3xl space-y-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          <div className="mt-6 rounded-lg bg-maroon px-5 py-6 text-ivory sm:px-7">
            <p className="text-xs font-semibold uppercase text-gold">
              Our Mission
            </p>
            <blockquote className="mt-2 font-serif text-xl leading-8 sm:text-2xl">
              "To preserve, celebrate, and reintroduce the timeless heritage of
              the Koch Rajbanshi community - so that future generations can wear
              it, read about it, experience it, and proudly carry it forward."
            </blockquote>
          </div>

          <blockquote className="mt-7 border-t border-maroon/15 pt-7 text-center font-serif text-2xl leading-9 text-maroon sm:text-3xl sm:leading-10">
            "Every product we create carries a story. Every purchase helps keep
            that story alive."
          </blockquote>
          <div className="mt-6 text-center"><Link className="inline-flex min-h-10 items-center rounded-full border border-maroon/25 px-4 text-sm font-semibold text-maroon transition hover:border-maroon hover:bg-maroon/5" to={ROUTES.SHOP}>Explore the House of Patani collection</Link></div>

        </motion.div>
          </>
        ) : null}
      </div>
    </section>
  );
}
