const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const decimal2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const decimalUpTo1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
// Whole cm give at most 4 decimals in m², so the shown area is exact and recomputes to the shown price.
const area = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

/** 66360 → "663,60 €" */
export const formatCents = (cents: number) => euro.format(cents / 100);

/** 395 → "395,00 €" */
export const formatEur = (eur: number) => euro.format(eur);

/** 0.19 → "19 %" */
export const formatPercent = (rate: number) => `${Math.round(rate * 100)} %`;

/** 1.68 → "1,68" */
export const formatDecimal = (n: number) => decimal2.format(n);

/** 1.68 → "1,68", 1.7061 → "1,7061" */
export const formatArea = (m2: number) => area.format(m2);

/** 120 → "120" */
export const formatCm = (cm: number) => decimalUpTo1.format(cm);

/** Reads whole centimetres like "120". Returns NaN for anything else, also "120,5". */
export function parseCm(text: string): number {
  const trimmed = text.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : NaN;
}
