import { describe, expect, it } from 'vitest';
import { calculateQuote, checkWindow, isSubsidyEligible, type OrderInput, type Quote, type WindowInput } from './calculate';
import { config, type Config } from './config';
import { findProduct } from './products';

// Therm 82, 120 × 140 cm: the example from the price sheet.
const window = (overrides: Partial<WindowInput> = {}): WindowInput => ({
  productId: 'FN-K82-3',
  widthMm: 1200,
  heightMm: 1400,
  quantity: 1,
  opening: 'tiltTurn',
  rollerShutter: false,
  interiorSill: false,
  ...overrides,
});

function quote(order: OrderInput, cfg: Config = config): Quote {
  const result = calculateQuote(order, cfg);
  if (!result.ok) throw new Error(`Unexpected problems: ${JSON.stringify(result.problems)}`);
  return result.quote;
}

const first = (q: Quote) => q.lines[0]!;

describe('window price', () => {
  it('matches the example in the price sheet: 1.68 m² × 395 € = 663.60 €', () => {
    const line = first(quote({ windows: [window()] }));
    expect(line.areaM2).toBeCloseTo(1.68);
    expect(line.unit.baseCents).toBe(66360);
  });

  it('charges small windows as 0.8 m²', () => {
    const q = quote({ windows: [window({ widthMm: 500, heightMm: 600 })] });
    expect(first(q).chargedAreaM2).toBe(0.8);
    expect(first(q).unit.baseCents).toBe(31600); // 0.8 × 395
    expect(q.notes).toContain('minAreaApplied');
  });

  it('gives 15 % off for fixed glazing', () => {
    const line = first(quote({ windows: [window({ opening: 'fixed' })] }));
    expect(line.unit.fixedGlazingDiscountCents).toBe(-9954);
    expect(line.unit.totalCents).toBe(56406);
  });

  it('adds 120 € for a two-sash window', () => {
    expect(first(quote({ windows: [window({ opening: 'twoSash' })] })).unit.totalCents).toBe(78360);
  });

  it('adds 95 € per metre of width for a roller shutter', () => {
    expect(first(quote({ windows: [window({ rollerShutter: true })] })).unit.rollerShutterCents).toBe(11400);
  });

  it('adds 38 € per metre of width for an interior sill', () => {
    expect(first(quote({ windows: [window({ interiorSill: true })] })).unit.interiorSillCents).toBe(4560);
  });

  it('multiplies by quantity', () => {
    expect(first(quote({ windows: [window({ quantity: 3 })] })).totalCents).toBe(199080);
  });
});

describe('order total', () => {
  it('adds installation and 19 % VAT', () => {
    const q = quote({ windows: [window()] });
    expect(q.installation.totalCents).toBe(18000);
    expect(q.netCents).toBe(84360);
    expect(q.vatCents).toBe(16028); // 843.60 × 0.19 = 160.284
    expect(q.grossCents).toBe(100388);
  });

  it('gives no volume discount for 9 windows', () => {
    expect(quote({ windows: [window({ quantity: 9 })] }).volumeDiscountCents).toBe(0);
  });

  it('gives 5 % on window prices from 10 windows, not on installation', () => {
    const q = quote({ windows: [window({ quantity: 6 }), window({ quantity: 4 })] });
    expect(q.windowCount).toBe(10);
    expect(q.volumeDiscountCents).toBe(-33180); // 5 % of 6,636.00 €
    expect(q.installation.totalCents).toBe(180000);
    expect(q.netCents).toBe(663600 - 33180 + 180000);
  });

  it('applies the volume discount to the price after the fixed-glazing discount', () => {
    const q = quote({ windows: [window({ quantity: 10, opening: 'fixed' })] });
    expect(q.volumeDiscountCents).toBe(-28203); // 5 % of 10 × 564.06 €
  });

  it('leaves extras out of the volume discount unless configured', () => {
    const order = { windows: [window({ quantity: 10, opening: 'twoSash' as const })] };
    expect(quote(order).volumeDiscountCents).toBe(-33180);
    expect(quote(order, { ...config, volumeDiscountIncludesExtras: true }).volumeDiscountCents).toBe(-39180);
  });
});

describe('installation models (open question, review item 1)', () => {
  const order = { windows: [window({ quantity: 4 })] };

  it('perWindow: 180 € × 4', () => {
    expect(quote(order, { ...config, installationModel: 'perWindow' }).installation.totalCents).toBe(72000);
  });

  it('flatFeePlusRemoval: 450 € + 60 € × 4', () => {
    expect(quote(order, { ...config, installationModel: 'flatFeePlusRemoval' }).installation.totalCents).toBe(69000);
  });

  it('flatFeePlusPerWindow: 450 € + 180 € × 4', () => {
    expect(quote(order, { ...config, installationModel: 'flatFeePlusPerWindow' }).installation.totalCents).toBe(117000);
  });
});

describe('size limits', () => {
  it('uses the limits of the chosen system', () => {
    expect(checkWindow(window({ productId: 'FN-K82-3', widthMm: 420 }))).toEqual([]);
    expect(checkWindow(window({ productId: 'FN-H68-3', widthMm: 420 }))).toEqual(['widthTooSmall']);
  });

  it('accepts the exact maximum and rejects 1 mm more', () => {
    expect(checkWindow(window({ productId: 'FN-A75-3', heightMm: 2600 }))).toEqual([]);
    expect(checkWindow(window({ productId: 'FN-A75-3', heightMm: 2601 }))).toEqual(['heightTooLarge']);
  });

  it('rejects narrow two-sash windows', () => {
    expect(checkWindow(window({ opening: 'twoSash', widthMm: 700 }))).toEqual(['twoSashTooNarrow']);
  });

  it('returns problems instead of a price', () => {
    const result = calculateQuote({ windows: [window(), window({ productId: 'FN-XX', quantity: 0 })] });
    expect(result).toEqual({ ok: false, problems: [{ index: 1, problems: ['unknownProduct'] }] });
  });
});

describe('notes', () => {
  it('flags postcodes outside 20000–25999', () => {
    expect(quote({ windows: [window()], postcode: '30159' }).notes).toContain('outsideServiceArea');
    expect(quote({ windows: [window()], postcode: '22301' }).notes).not.toContain('outsideServiceArea');
    expect(quote({ windows: [window()], postcode: '25999' }).notes).not.toContain('outsideServiceArea');
  });

  it('flags scaffolding from the 2nd floor', () => {
    expect(quote({ windows: [window()], highestFloor: 1 }).notes).not.toContain('scaffoldingPossible');
    expect(quote({ windows: [window()], highestFloor: 2 }).notes).toContain('scaffoldingPossible');
  });

  it('flags two-person installation above 3.0 m², not at exactly 3.0 m²', () => {
    expect(quote({ windows: [window({ widthMm: 1500, heightMm: 2000 })] }).notes).not.toContain('twoPersonInstall');
    expect(quote({ windows: [window({ widthMm: 2000, heightMm: 1600 })] }).notes).toContain('twoPersonInstall');
  });
});

describe('subsidy note (review item 2)', () => {
  it('shows it only for Uw ≤ 0.95', () => {
    const eligible = (id: string) => isSubsidyEligible(findProduct(id)!);
    expect(eligible('FN-K82-3')).toBe(true); // 0.90
    expect(eligible('FN-H68-3')).toBe(true); // 0.95, on the limit
    expect(eligible('FN-A75-3')).toBe(false); // 1.0, triple-glazed but above the limit
    expect(eligible('FN-K70-2')).toBe(false); // 1.1, double-glazed
  });
});
