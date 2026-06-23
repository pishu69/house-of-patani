import { ArtisanSection } from "@/components/home/ArtisanSection";
import { HeritageStorySection } from "@/components/home/HeritageStorySection";
import { PageHero } from "@/components/common/PageHero";
import { useSettings } from "@/hooks";

export function AboutPage() {
  const settingsQuery = useSettings();
  const settings = settingsQuery.data?.data;

  return (
    <>
      <PageHero
        description={
          settings?.aboutHeroDescription ??
          "A luxury heritage identity inspired by Indian craft marketplaces, refined for a modern premium storefront."
        }
        eyebrow={settings?.aboutHeroEyebrow ?? "Our Story"}
        title={settings?.aboutHeroTitle ?? "A more graceful home for tradition"}
      />
      <HeritageStorySection />
      <ArtisanSection />
    </>
  );
}
