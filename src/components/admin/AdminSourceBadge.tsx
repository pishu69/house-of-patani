import { Database, Layers3 } from "lucide-react";

import type { DataSource } from "@/lib/errors";

interface AdminSourceBadgeProps {
  source?: DataSource | undefined;
}

export function AdminSourceBadge({ source = "mock" }: AdminSourceBadgeProps) {
  const Icon = source === "supabase" ? Database : Layers3;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-maroon/10 bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
      <Icon aria-hidden="true" size={13} />
      {source === "supabase" ? "Live data" : "Preview data"}
    </span>
  );
}
