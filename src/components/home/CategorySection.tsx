import { motion } from "framer-motion";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CategoryCard } from "@/components/home/CategoryCard";
import { ROUTES } from "@/constants/routes";
import { useCategories } from "@/hooks";
import { shopCategories } from "@/data/categories";

export function CategorySection() {
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data?.data ?? shopCategories;

  return (
    <section
      className="scroll-mt-24 bg-background py-16 sm:py-20 lg:py-24"
      id="categories"
    >
      <div className="section-shell">
        <SectionHeader
          description="Explore familiar Indian categories elevated through texture, restraint, and considered presentation."
          eyebrow="Curated Departments"
          title="Crafted for everyday ceremony"
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              key={category.name}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              viewport={{ once: true, amount: 0.25 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <CategoryCard
  category={category}
  to={`${ROUTES.SHOP}?category=${category.slug}`}
/>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
