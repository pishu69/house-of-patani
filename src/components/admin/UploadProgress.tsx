interface UploadProgressProps {
  fileName: string;
  progress: number;
}

export function UploadProgress({
  fileName,
  progress,
}: UploadProgressProps) {
  return (
    <div className="rounded-md border border-maroon/10 bg-background p-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="truncate font-medium text-charcoal">{fileName}</span>
        <span className="text-muted-foreground">{progress}%</span>
      </div>
      <div
        aria-label={`Uploading ${fileName}`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-maroon/10"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-gold transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
