export function formatDate(
  value: Date | string | number,
  locale = "en-IN",
) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(value));
}
