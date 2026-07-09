import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";
import type { CategoryCard as CategoryCardData } from "@/constants/mock-data";
import { createImageSrcSet } from "@/utils/image";

interface CategoryCardProps {
  category: CategoryCardData;
  to: string;
}

function CategoryCardComponent({ category, to }: CategoryCardProps) {
  return (
    <motion.article
      className="h-full"
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -3 }}
    >
      <Link
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-maroon/10 bg-card shadow-lift transition duration-300 hover:border-gold/60"
        to={to}
      >
        <div className="aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
          <img
            alt={category.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            decoding="async"
            loading="lazy"
            sizes="(min-width: 1280px) 24vw, (min-width: 768px) 33vw, 50vw"
            src={category.imageUrl}
            srcSet={createImageSrcSet(category.imageUrl)}
          />
        </div>
        <div className="flex flex-1 items-start justify-between gap-2.5 p-3 sm:gap-3 sm:p-4">
          <div>
            <h3 className="text-base leading-snug sm:text-xl">{category.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground sm:mt-1.5 sm:text-sm">
              {category.description}
            </p>
          </div>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-1 shrink-0 text-gold transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            size={16}
          />
        </div>
      </Link>
    </motion.article>
  );
}

export const CategoryCard = memo(CategoryCardComponent);
