import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface ImageDeleteConfirmProps {
  imageName: string;
  isDeleting?: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ImageDeleteConfirm({
  imageName,
  isDeleting = false,
  isOpen,
  onCancel,
  onConfirm,
}: ImageDeleteConfirmProps) {
  return (
    <ConfirmDialog
      confirmDisabled={isDeleting}
      confirmLabel={isDeleting ? "Deleting..." : "Delete image"}
      description={`Delete ${imageName}? The image will be removed from this media area.`}
      isOpen={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title="Delete image"
    />
  );
}
