import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/common/IconButton";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  onPageChange?: (page: number) => void;
  totalPages: number;
}

export function Pagination({
  currentPage,
  onPageChange,
  totalPages,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="flex justify-center gap-2">
      <IconButton
        aria-label="Previous page"
        disabled={currentPage <= 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        size="sm"
        variant="outline"
      >
        <ChevronLeft aria-hidden="true" size={17} />
      </IconButton>
      {pages.map((page) => (
        <button
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            "h-9 min-w-9 rounded-full px-2 text-sm font-semibold transition",
            page === currentPage
              ? "bg-maroon text-ivory"
              : "border border-maroon/15 text-maroon hover:bg-maroon/5",
          )}
          key={page}
          onClick={() => onPageChange?.(page)}
          type="button"
        >
          {page}
        </button>
      ))}
      <IconButton
        aria-label="Next page"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        size="sm"
        variant="outline"
      >
        <ChevronRight aria-hidden="true" size={17} />
      </IconButton>
    </nav>
  );
}
