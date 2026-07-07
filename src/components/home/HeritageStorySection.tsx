import { Link } from "react-router-dom";
import { StorySection } from "@/components/home/StorySection";
import { ROUTES } from "@/constants/routes";
import { useSettings } from "@/hooks";

export function HeritageStorySection() {
  const settingsQuery = useSettings();
  const settings = settingsQuery.data?.data;

  return (
    <section className="bg-background py-7 sm:py-10 lg:py-12">
      <StorySection
        action={
          <Link
            className="inline-flex rounded-full border border-maroon/25 px-4 py-2.5 text-sm font-semibold text-maroon transition hover:border-maroon hover:bg-maroon/5"
            to={ROUTES.ABOUT}
          >
            Read the Story
          </Link>
        }
        description={
          <p>
            {settings?.heritageDescription ??
              "House of Patani is imagined as a calm, premium home for Koch Rajbanshi artistry."}
          </p>
        }
        eyebrow={settings?.heritageEyebrow ?? "Our Heritage"}
        compact
        imageAlt="Traditional Koch Rajabnshi craft and textiles arranged in a heritage interior"
        imageUrl="/images/about/heritage.jpg"
        title={
          settings?.heritageTitle ??
          "A house for craft that remembers where it came from."
        }
      />
    </section>
  );
}
