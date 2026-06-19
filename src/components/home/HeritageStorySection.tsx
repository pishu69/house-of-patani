import { Link } from "react-router-dom";
import { StorySection } from "@/components/home/StorySection";
import { ROUTES } from "@/constants/routes";

export function HeritageStorySection() {
  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <StorySection
        action={
          <Link
            className="inline-flex rounded-full border border-maroon/25 px-5 py-3 text-sm font-semibold text-maroon transition hover:border-maroon hover:bg-maroon/5"
            to={ROUTES.ABOUT}
          >
            Read the Story
          </Link>
        }
        description={
          <>
            <p>
              House of Patani is imagined as a calm, premium home for Indian
              artistry. It carries the warmth of familiar craft marketplaces
              and refines that feeling with thoughtful spacing, quiet
              typography, and a palette rooted in ivory, maroon, and muted gold.
            </p>
            <p>
              Every visual detail is designed to make heritage feel usable,
              modern, and emotionally close.
            </p>
          </>
        }
        eyebrow="Our Heritage"
        imageAlt="Traditional Indian craft and textiles arranged in a heritage interior"
        imageUrl="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85"
        title="A house for craft that remembers where it came from."
      />
    </section>
  );
}
