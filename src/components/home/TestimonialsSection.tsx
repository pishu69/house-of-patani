import { motion } from "framer-motion";
import { testimonials } from "@/constants/mock-data";

export function TestimonialsSection() {
  return (
    <section className="bg-background py-10 sm:py-14 lg:py-16">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Kind Words</p>
          <h2 className="mt-2.5 text-3xl leading-tight sm:text-4xl md:text-[2.75rem]">
            Familiar, but much more refined
          </h2>
          <p className="mx-auto mt-2.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base md:leading-7">
            Words from those who value craft, warmth, and a quieter expression of luxury.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.article
              className="rounded-lg border border-maroon/10 bg-card p-4 shadow-lift sm:p-5"
              initial={{ opacity: 0, y: 18 }}
              key={testimonial.name}
              transition={{
                delay: index * 0.08,
                duration: 0.45,
                ease: "easeOut",
              }}
              viewport={{ once: true, amount: 0.25 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <p className="font-serif text-lg leading-7 text-charcoal sm:text-xl sm:leading-8">
                "{testimonial.quote}"
              </p>
              <div className="mt-4 border-t border-maroon/10 pt-3.5">
                <p className="font-semibold text-maroon">{testimonial.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {testimonial.location}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
