import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const labels: Record<string, string> = {
  admin: "Overview",
  coupons: "Coupons",
  customers: "Customers",
  edit: "Edit",
  new: "New product",
  orders: "Orders",
  products: "Products",
  settings: "Settings",
};

function formatSegment(segment: string) {
  return labels[segment] ?? segment.replace(/-/g, " ");
}

export function AdminBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Admin breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const to = `/${segments.slice(0, index + 1).join("/")}`;

          return (
            <li className="flex items-center gap-2" key={`${segment}-${index}`}>
              {index > 0 ? (
                <ChevronRight aria-hidden="true" size={13} />
              ) : null}
              {isLast ? (
                <span aria-current="page" className="font-medium text-charcoal">
                  {formatSegment(segment)}
                </span>
              ) : (
                <Link className="transition hover:text-maroon" to={to}>
                  {formatSegment(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
