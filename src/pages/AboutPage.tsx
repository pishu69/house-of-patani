import { ArtisanSection } from "@/components/home/ArtisanSection";
import { HeritageStorySection } from "@/components/home/HeritageStorySection";
import { PageHero } from "@/components/common/PageHero";

export function AboutPage() {
  return (
    <>
      <PageHero
        description="A luxury heritage identity inspired by Indian craft marketplaces, refined for a modern premium storefront."
        eyebrow="Our Story"
        title="A more graceful home for tradition"
      />
      <HeritageStorySection />
      <ArtisanSection />
    </>
  );
}
