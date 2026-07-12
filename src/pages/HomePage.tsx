import { Seo } from "@/components/common/Seo";
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
      <Seo
        canonicalPath="/"
        description="Discover Koch Rajbanshi traditional clothing, Patani, books, handicrafts, home décor, and heritage-inspired products from House of Patani."
        image="/images/social/home-share-v1.jpg"
        imageAlt="House of Patani heritage-inspired homepage banner"
        title="House of Patani | Koch Rajbanshi Heritage, Patani, Books & Handicrafts"
        type="website"
      />
      <HeroSection />
      <CategorySection />
      <FeaturedProductsSection />
      <HeritageStorySection compact />
      <ArtisanSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
