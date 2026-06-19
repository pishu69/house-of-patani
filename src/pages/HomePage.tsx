import { ArtisanSection } from "@/components/home/ArtisanSection";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { HeritageStorySection } from "@/components/home/HeritageStorySection";
import { HeroSection } from "@/components/home/HeroSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedProductsSection />
      <HeritageStorySection />
      <ArtisanSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
