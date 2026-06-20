import { Star } from "lucide-react";

export function PrimaryImageBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-maroon px-2.5 py-1 text-[0.65rem] font-semibold text-ivory shadow-sm">
      <Star aria-hidden="true" fill="currentColor" size={11} />
      Primary
    </span>
  );
}
