import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <li>
          <Link
            aria-label="Home"
            className="transition hover:text-maroon"
            to="/"
          >
            <Home aria-hidden="true" size={16} />
          </Link>
        </li>
        {items.map((item, index) => (
          <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
            <ChevronRight aria-hidden="true" size={14} />
            {item.to ? (
              <Link className="transition hover:text-maroon" to={item.to}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-charcoal">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
