import { Instagram } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useSettings } from "@/hooks";

interface InstagramItem {
  alt: string;
  imageUrl: string;
}

interface InstagramSectionProps {
  handle?: string;
  items: InstagramItem[];
}

function getInstagramHandle(url: string | undefined) {
  if (!url) return "@houseofpatani";
  const clean = url.replace(/\/$/, "");
  const handle = clean.split("/").filter(Boolean).pop();
  return handle ? `@${handle}` : "@houseofpatani";
}

export function InstagramSection({
  handle,
  items,
}: InstagramSectionProps) {
  const settingsQuery = useSettings();
  const instagramUrl = settingsQuery.data?.data.instagram || "/";
  const resolvedHandle = handle ?? getInstagramHandle(settingsQuery.data?.data.instagram);

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="section-shell">
        <SectionHeading
          description={`Follow ${resolvedHandle} for new craft stories and collection notes.`}
          eyebrow="From the House"
          title="A living archive of craft"
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 md:grid-cols-4">
          {items.map((item) => (
            <a
              aria-label={`View ${item.alt} on Instagram`}
              className="group relative overflow-hidden rounded-lg"
              href={instagramUrl}
              key={item.imageUrl}
              rel="noreferrer"
              target="_blank"
            >
              <img
                alt={item.alt}
                className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
                src={item.imageUrl}
              />
              <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 text-ivory opacity-0 transition group-hover:bg-charcoal/35 group-hover:opacity-100">
                <Instagram aria-hidden="true" size={24} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
