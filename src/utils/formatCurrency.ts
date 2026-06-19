export function formatCurrency(
  value: number,
  currency = "INR",
  locale = "en-IN",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}
