import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyProductsStateProps {
  action?: ReactNode;
  description?: string;
}

export function EmptyProductsState({
  action,
  description = "Try adjusting your search or filters to discover more pieces.",
}: EmptyProductsStateProps) {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-maroon/10 bg-card px-5 py-10 text-center shadow-lift sm:px-8 sm:py-12">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-maroon">
        <SearchX aria-hidden="true" size={24} />
      </span>
      <h2 className="mt-5 text-3xl">No pieces found</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
