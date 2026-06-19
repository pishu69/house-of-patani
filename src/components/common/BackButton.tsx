import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  fallbackPath?: string;
  label?: string;
}

export function BackButton({
  fallbackPath = "/",
  label = "Back",
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath);
  };

  return (
    <Button onClick={handleClick} size="sm" variant="ghost">
      <ArrowLeft aria-hidden="true" size={17} />
      {label}
    </Button>
  );
}
