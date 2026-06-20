import { FlaskConical } from "lucide-react";

export function DemoAdminBanner() {
  return (
    <div
      className="flex min-h-10 items-center justify-center gap-2 bg-gold px-4 py-2 text-center text-xs font-semibold text-charcoal"
      role="status"
    >
      <FlaskConical aria-hidden="true" size={15} />
      Demo Admin Mode - not connected to Supabase
    </div>
  );
}
