import { Share2 } from "lucide-react";
import { IconButton } from "@/components/common/IconButton";

interface ShareButtonProps {
  label?: string;
  onShare?: () => void;
}

export function ShareButton({
  label = "Share",
  onShare,
}: ShareButtonProps) {
  return (
    <IconButton aria-label={label} onClick={onShare} variant="outline">
      <Share2 aria-hidden="true" size={18} />
    </IconButton>
  );
}
