import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Users,
  type LucideIcon,
} from "lucide-react";

interface ImpactItem {
  description: string;
  Icon: LucideIcon;
  title: string;
}

const impactItems: ImpactItem[] = [
  {
    description:
      "Support the documentation, preservation, and promotion of Koch Rajbanshi history, language, traditions, and cultural identity.",
    Icon: BookOpen,
    title: "Preserve Our Heritage",
  },
  {
    description:
      "Help organize youth awareness initiatives, leadership programs, cultural events, and community development projects.",
    Icon: Users,
    title: "Empower Our Youth",
  },
  {
    description:
      "Contribute towards educational opportunities, learning resources, scholarships, and knowledge-sharing initiatives for students.",
    Icon: GraduationCap,
    title: "Support Education",
  },
  {
    description:
      "Provide assistance during emergencies and support meaningful welfare initiatives that improve the lives of Koch Rajbanshi families.",
    Icon: HeartHandshake,
    title: "Community Welfare",
  },
];

export function ArtisanSection() {
  return (
    <section className="bg-linen/55 py-8 sm:py-10 lg:py-12">
      <div className="section-shell">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <p className="eyebrow">Every Order Creates an Impact</p>
          <h2 className="mt-2.5 text-3xl leading-tight text-maroon sm:text-4xl lg:text-5xl">
            Wear Your Heritage. Strengthen Your Community.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            A portion of every House of Patani purchase is dedicated to
            preserving our heritage and empowering the Koch Rajbanshi community
            for generations to come.
          </p>
        </motion.div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {impactItems.map(({ description, Icon, title }, index) => (
            <motion.article
              className="rounded-lg border border-maroon/10 bg-card p-4 shadow-lift"
              initial={{ opacity: 0, y: 18 }}
              key={title}
              transition={{
                delay: index * 0.06,
                duration: 0.5,
                ease: "easeOut",
              }}
              viewport={{ once: true, amount: 0.2 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-maroon">
                <Icon aria-hidden="true" size={17} />
              </span>
              <h3 className="mt-3 text-xl text-charcoal">{title}</h3>
              <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                {description}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="mt-5 grid gap-3 border-t border-maroon/10 pt-5 text-sm leading-6 md:grid-cols-[1.15fr_0.85fr]"
          initial={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <p className="font-medium text-charcoal">
            When House of Patani grows, our community grows with it. Every
            purchase helps us invest back into initiatives that preserve our
            heritage and strengthen future generations.
          </p>
          <p className="rounded-md border border-gold/25 bg-gold/8 px-4 py-3 text-muted-foreground">
            <strong className="text-maroon">Transparency Matters</strong> - As
            House of Patani grows, we will regularly share updates about the
            community initiatives supported through your purchases.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
