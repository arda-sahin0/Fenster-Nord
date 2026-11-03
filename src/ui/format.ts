const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const decimal2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const decimalUpTo1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });

/** 66360 → "663,60 €" */
export const formatCents = (cents: number) => euro.format(cents / 100);

/** 395 → "395,00 €" */
export const formatEur = (eur: number) => euro.format(eur);

/** 1.68 → "1,68" */
export const formatDecimal = (n: number) => decimal2.format(n);

/** 120 → "120", 120.5 → "120,5" */
export const formatCm = (cm: number) => decimalUpTo1.format(cm);

/** Reads "120", "120,5" or "120.5". Returns NaN for anything else. */
export function parseCm(text: string): number {
  const trimmed = text.trim().replace(',', '.');
  return /^\d+(\.\d)?$/.test(trimmed) ? Number(trimmed) : NaN;
}
