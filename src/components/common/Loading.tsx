import { LoaderCircle } from "lucide-react";

export function Loading() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center bg-background"
      role="status"
    >
      <div className="flex items-center gap-3 text-sm font-semibold text-maroon">
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin text-gold"
          size={20}
        />
        Preparing the collection
      </div>
    </div>
  );
}
