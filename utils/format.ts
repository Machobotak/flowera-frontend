/** Shared formatting utilities used across checkout, cart, and profile pages. */

export const FILL_STYLE = { fontVariationSettings: "'FILL' 1" } as const;

export function formatRupiah(value: number): string {
  const num = Number(value);
  if (isNaN(num) || num === undefined || num === null) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
