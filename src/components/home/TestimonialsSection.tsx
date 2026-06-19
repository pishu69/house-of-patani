import { motion } from "framer-motion";
import { SectionHeader } from "@/components/common/SectionHeader";
import { testimonials } from "@/constants/mock-data";

export function TestimonialsSection() {
  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="section-shell">
        <SectionHeader
          description="Words from those who value craft, warmth, and a quieter expression of luxury."
          eyebrow="Kind Words"
          title="Familiar, but much more refined"
        />
        <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.article
              className="rounded-lg border border-maroon/10 bg-card p-6 shadow-lift sm:p-7"
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
              <p className="font-serif text-xl leading-8 text-charcoal sm:text-2xl sm:leading-9">
                "{testimonial.quote}"
              </p>
              <div className="mt-6 border-t border-maroon/10 pt-5">
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
