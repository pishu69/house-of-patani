import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/common/IconButton";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle?: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <IconButton
      aria-label={isDark ? "Use light theme" : "Use dark theme"}
      onClick={onToggle}
      variant="outline"
    >
      {isDark ? (
        <Sun aria-hidden="true" size={18} />
      ) : (
        <Moon aria-hidden="true" size={18} />
      )}
    </IconButton>
  );
}
