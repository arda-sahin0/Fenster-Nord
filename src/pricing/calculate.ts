import { config } from './config';
import { findProduct, type Product } from './products';

export type Opening = 'tiltTurn' | 'fixed' | 'twoSash';

export interface WindowInput {
  productId: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  opening: Opening;
  rollerShutter: boolean;
  interiorSill: boolean;
}

export interface OrderInput {
  windows: WindowInput[];
  /** German postcode, five digits. Optional until the customer enters it. */
  postcode?: string;
  /** Highest floor with a window: 0 = ground floor. */
  highestFloor?: number;
}

export type WindowProblem =
  | 'unknownProduct'
  | 'invalidQuantity'
  | 'widthTooSmall'
  | 'widthTooLarge'
  | 'heightTooSmall'
  | 'heightTooLarge'
  | 'twoSashTooNarrow';

/** Prices for one window of a line. All amounts in cents, net. Discounts are negative. */
export interface UnitPrice {
  baseCents: number;
  fixedGlazingDiscountCents: number;
  twoSashSurchargeCents: number;
  rollerShutterCents: number;
  interiorSillCents: number;
  totalCents: number;
}

export interface WindowLine {
  input: WindowInput;
  product: Product;
  areaM2: number;
  chargedAreaM2: number;
  minAreaApplied: boolean;
  needsTwoPersonInstall: boolean;
  subsidyEligible: boolean;
  unit: UnitPrice;
  totalCents: number;
}

export interface Installation {
  flatFeeCents: number;
  removalCents: number;
  totalCents: number;
}

export type Note = 'outsideServiceArea' | 'scaffoldingPossible' | 'twoPersonInstall';

export interface Quote {
  lines: WindowLine[];
  windowCount: number;
  windowsSubtotalCents: number;
  volumeDiscountCents: number;
  installation: Installation;
  netCents: number;
  vatCents: number;
  grossCents: number;
  notes: Note[];
}

export type QuoteResult =
  | { ok: true; quote: Quote }
  | { ok: false; problems: { index: number; problems: WindowProblem[] }[] };

const cents = (eur: number) => Math.round(eur * 100);
/** Discount as a negative amount, rounded to whole cents. */
const discount = (amountCents: number, rate: number) => -Math.round(amountCents * rate);

export function isSubsidyEligible(product: Product): boolean {
  return product.uw <= config.subsidyMaxUw;
}

/** Checks one window against the size limits of its system. Empty list = fine. */
export function checkWindow(input: WindowInput): WindowProblem[] {
  const product = findProduct(input.productId);
  if (!product) return ['unknownProduct'];

  const problems: WindowProblem[] = [];
  if (!Number.isInteger(input.quantity) || input.quantity < 1) problems.push('invalidQuantity');
  if (input.widthMm < product.widthMinMm) problems.push('widthTooSmall');
  if (input.widthMm > product.widthMaxMm) problems.push('widthTooLarge');
  if (input.heightMm < product.heightMinMm) problems.push('heightTooSmall');
  if (input.heightMm > product.heightMaxMm) problems.push('heightTooLarge');
  if (input.opening === 'twoSash' && input.widthMm < config.twoSashMinWidthMm) problems.push('twoSashTooNarrow');
  return problems;
}

function priceWindow(input: WindowInput, product: Product): WindowLine {
  const widthM = input.widthMm / 1000;
  const areaM2 = (input.widthMm * input.heightMm) / 1_000_000;
  const chargedAreaM2 = Math.max(areaM2, config.minChargedAreaM2);

  const baseCents = cents(chargedAreaM2 * product.pricePerM2Eur);
  const unit: UnitPrice = {
    baseCents,
    fixedGlazingDiscountCents: input.opening === 'fixed' ? discount(baseCents, config.fixedGlazingDiscount) : 0,
    twoSashSurchargeCents: input.opening === 'twoSash' ? cents(config.twoSashSurchargeEur) : 0,
    rollerShutterCents: input.rollerShutter ? cents(widthM * config.rollerShutterEurPerM) : 0,
    interiorSillCents: input.interiorSill ? cents(widthM * config.interiorSillEurPerM) : 0,
    totalCents: 0,
  };
  unit.totalCents =
    unit.baseCents +
    unit.fixedGlazingDiscountCents +
    unit.twoSashSurchargeCents +
    unit.rollerShutterCents +
    unit.interiorSillCents;

  return {
    input,
    product,
    areaM2,
    chargedAreaM2,
    minAreaApplied: areaM2 < config.minChargedAreaM2,
    needsTwoPersonInstall: areaM2 > config.twoPersonInstallAboveM2,
    subsidyEligible: isSubsidyEligible(product),
    unit,
    totalCents: unit.totalCents * input.quantity,
  };
}

/** The part of a line the volume discount applies to: window price including opening type (see config). */
function discountBaseCents(line: WindowLine): number {
  const u = line.unit;
  return (u.baseCents + u.fixedGlazingDiscountCents + u.twoSashSurchargeCents) * line.input.quantity;
}

/** Flat fee per order plus removal of one old window per new window. */
function priceInstallation(windowCount: number): Installation {
  const flatFeeCents = cents(config.installationFlatFeeEur);
  const removalCents = cents(config.removalPerOldWindowEur) * windowCount;
  return { flatFeeCents, removalCents, totalCents: flatFeeCents + removalCents };
}

/** undefined while the postcode is not five digits. */
export function isInServiceArea(postcode: string): boolean | undefined {
  if (!/^\d{5}$/.test(postcode.trim())) return undefined;
  const n = Number(postcode);
  return n >= config.serviceAreaPostcodes.from && n <= config.serviceAreaPostcodes.to;
}

export function calculateQuote(order: OrderInput): QuoteResult {
  const problems = order.windows
    .map((w, index) => ({ index, problems: checkWindow(w) }))
    .filter((p) => p.problems.length > 0);
  if (problems.length > 0) return { ok: false, problems };

  const lines = order.windows.map((w) => priceWindow(w, findProduct(w.productId)!));
  const windowCount = lines.reduce((sum, l) => sum + l.input.quantity, 0);
  const windowsSubtotalCents = lines.reduce((sum, l) => sum + l.totalCents, 0);

  const volumeDiscountCents =
    windowCount >= config.volumeDiscountMinWindows
      ? discount(lines.reduce((sum, l) => sum + discountBaseCents(l), 0), config.volumeDiscount)
      : 0;

  const installation = priceInstallation(windowCount);
  const netCents = windowsSubtotalCents + volumeDiscountCents + installation.totalCents;
  const vatCents = Math.round(netCents * config.vatRate);

  const notes: Note[] = [];
  if (order.postcode !== undefined && isInServiceArea(order.postcode) === false) notes.push('outsideServiceArea');
  if ((order.highestFloor ?? 0) >= config.scaffoldingFromFloor) notes.push('scaffoldingPossible');
  if (lines.some((l) => l.needsTwoPersonInstall)) notes.push('twoPersonInstall');

  return {
    ok: true,
    quote: {
      lines,
      windowCount,
      windowsSubtotalCents,
      volumeDiscountCents,
      installation,
      netCents,
      vatCents,
      grossCents: netCents + vatCents,
      notes,
    },
  };
}
