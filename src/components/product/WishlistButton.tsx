import { Heart } from "lucide-react";
import { IconButton } from "@/components/common/IconButton";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  active?: boolean;
  onToggle?: () => void;
}

export function WishlistButton({
  active = false,
  onToggle,
}: WishlistButtonProps) {
  return (
    <IconButton
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={onToggle}
      variant="outline"
    >
      <Heart
        aria-hidden="true"
        className={cn(active && "fill-maroon")}
        size={18}
      />
    </IconButton>
  );
}
