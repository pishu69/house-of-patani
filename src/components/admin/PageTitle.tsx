import type { ReactNode } from "react";

interface PageTitleProps {
  action?: ReactNode;
  description?: string;
  title: string;
}

export function PageTitle({ action, description, title }: PageTitleProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
