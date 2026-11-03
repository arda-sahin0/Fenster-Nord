import { describe, expect, it } from 'vitest';
import { parseProductCsv, products } from './products';

const HEADER =
  'artikelnr;bezeichnung;material;verglasung;uw_w_m2k;preis_netto_eur_m2;breite_min_mm;breite_max_mm;hoehe_min_mm;hoehe_max_mm';

describe('product list', () => {
  it('reads all six systems from the client CSV', () => {
    expect(products.map((p) => p.id)).toEqual([
      'FN-K70-2',
      'FN-K82-3',
      'FN-K82-3P',
      'FN-H68-3',
      'FN-HA78-3',
      'FN-A75-3',
    ]);
  });

  it('reads decimal commas', () => {
    const therm82 = products.find((p) => p.id === 'FN-K82-3')!;
    expect(therm82).toMatchObject({ name: 'Kunststofffenster Therm 82', uw: 0.9, pricePerM2Eur: 395 });
    expect(products.find((p) => p.id === 'FN-K70-2')!.uw).toBe(1.1);
  });

  it('rejects a file with different columns', () => {
    expect(() => parseProductCsv('artikelnr;preis\nX;1')).toThrow('Unexpected CSV header');
  });

  it('rejects a value that is not a number', () => {
    expect(() => parseProductCsv(`${HEADER}\nX;Name;Holz;3-fach;n/a;1;1;1;1;1`)).toThrow('line 2, uw_w_m2k');
  });

  it('accepts Windows line endings', () => {
    expect(parseProductCsv(`${HEADER}\r\nX;Name;Holz;3-fach;0,9;1;1;1;1;1\r\n`)).toHaveLength(1);
  });
});
