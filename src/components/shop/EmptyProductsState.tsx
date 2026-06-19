import { SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/common/EmptyState";

interface EmptyProductsStateProps {
  action?: ReactNode;
  description?: string;
}

export function EmptyProductsState({
  action,
  description = "Try adjusting your search or filters to discover more pieces.",
}: EmptyProductsStateProps) {
  return (
    <EmptyState
      action={action}
      description={description}
      icon={SearchX}
      title="No pieces found"
    />
  );
}
