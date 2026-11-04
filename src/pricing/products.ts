import csvText from '../data/produktliste.csv?raw';

export interface Product {
  id: string;
  name: string;
  material: string;
  glazing: string;
  uw: number;
  pricePerM2Eur: number;
  widthMinMm: number;
  widthMaxMm: number;
  heightMinMm: number;
  heightMaxMm: number;
}

const COLUMNS = [
  'artikelnr',
  'bezeichnung',
  'material',
  'verglasung',
  'uw_w_m2k',
  'preis_netto_eur_m2',
  'breite_min_mm',
  'breite_max_mm',
  'hoehe_min_mm',
  'hoehe_max_mm',
] as const;

/** Reads a number like "0,90" or "395". Throws on anything else. */
function parseNumber(value: string, where: string): number {
  const n = Number(value.trim().replace(',', '.'));
  if (value.trim() === '' || !Number.isFinite(n)) {
    throw new Error(`Not a number in ${where}: "${value}"`);
  }
  return n;
}

/** Parses the client's product list (semicolon-separated, decimal commas). */
export function parseProductCsv(text: string): Product[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  const header = lines[0]?.split(';').map((h) => h.trim());
  if (header?.join(';') !== COLUMNS.join(';')) {
    throw new Error(`Unexpected CSV header: ${lines[0]}`);
  }

  return lines.slice(1).map((line, i) => {
    const cells = line.split(';');
    if (cells.length !== COLUMNS.length) {
      throw new Error(`CSV line ${i + 2} has ${cells.length} columns, expected ${COLUMNS.length}`);
    }
    const cell = (col: (typeof COLUMNS)[number]) => cells[COLUMNS.indexOf(col)]!.trim();
    const num = (col: (typeof COLUMNS)[number]) => parseNumber(cell(col), `line ${i + 2}, ${col}`);
    return {
      id: cell('artikelnr'),
      name: cell('bezeichnung'),
      material: cell('material'),
      glazing: cell('verglasung'),
      uw: num('uw_w_m2k'),
      pricePerM2Eur: num('preis_netto_eur_m2'),
      widthMinMm: num('breite_min_mm'),
      widthMaxMm: num('breite_max_mm'),
      heightMinMm: num('hoehe_min_mm'),
      heightMaxMm: num('hoehe_max_mm'),
    };
  });
}

export const products: Product[] = parseProductCsv(csvText);

export function findProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
