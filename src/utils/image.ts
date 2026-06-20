const DEFAULT_WIDTHS = [480, 768, 1024, 1440];

function resizeUnsplashImage(source: string, width: number) {
  try {
    const url = new URL(source);

    if (url.hostname !== "images.unsplash.com") {
      return source;
    }

    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    return url.toString();
  } catch {
    return source;
  }
}

export function createImageSrcSet(
  source: string,
  widths: number[] = DEFAULT_WIDTHS,
) {
  if (!source.includes("images.unsplash.com")) {
    return undefined;
  }

  return widths
    .map((width) => `${resizeUnsplashImage(source, width)} ${width}w`)
    .join(", ");
}
