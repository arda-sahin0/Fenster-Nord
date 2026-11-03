import { config as defaultConfig, type Config, type InstallationModel } from './config';
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
  model: InstallationModel;
  flatFeeCents: number;
  perWindowCents: number;
  removalCents: number;
  totalCents: number;
}

export type Note = 'outsideServiceArea' | 'scaffoldingPossible' | 'twoPersonInstall' | 'minAreaApplied';

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

export function isSubsidyEligible(product: Product, cfg: Config = defaultConfig): boolean {
  return product.uw <= cfg.subsidyMaxUw;
}

/** Checks one window against the size limits of its system. Empty list = fine. */
export function checkWindow(input: WindowInput, cfg: Config = defaultConfig): WindowProblem[] {
  const product = findProduct(input.productId);
  if (!product) return ['unknownProduct'];

  const problems: WindowProblem[] = [];
  if (!Number.isInteger(input.quantity) || input.quantity < 1) problems.push('invalidQuantity');
  if (input.widthMm < product.widthMinMm) problems.push('widthTooSmall');
  if (input.widthMm > product.widthMaxMm) problems.push('widthTooLarge');
  if (input.heightMm < product.heightMinMm) problems.push('heightTooSmall');
  if (input.heightMm > product.heightMaxMm) problems.push('heightTooLarge');
  if (input.opening === 'twoSash' && input.widthMm < cfg.twoSashMinWidthMm) problems.push('twoSashTooNarrow');
  return problems;
}

function priceWindow(input: WindowInput, product: Product, cfg: Config): WindowLine {
  const widthM = input.widthMm / 1000;
  const areaM2 = (input.widthMm * input.heightMm) / 1_000_000;
  const chargedAreaM2 = Math.max(areaM2, cfg.minChargedAreaM2);

  const baseCents = cents(chargedAreaM2 * product.pricePerM2Eur);
  const unit: UnitPrice = {
    baseCents,
    fixedGlazingDiscountCents: input.opening === 'fixed' ? discount(baseCents, cfg.fixedGlazingDiscount) : 0,
    twoSashSurchargeCents: input.opening === 'twoSash' ? cents(cfg.twoSashSurchargeEur) : 0,
    rollerShutterCents: input.rollerShutter ? cents(widthM * cfg.rollerShutterEurPerM) : 0,
    interiorSillCents: input.interiorSill ? cents(widthM * cfg.interiorSillEurPerM) : 0,
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
    minAreaApplied: areaM2 < cfg.minChargedAreaM2,
    needsTwoPersonInstall: areaM2 > cfg.twoPersonInstallAboveM2,
    subsidyEligible: isSubsidyEligible(product, cfg),
    unit,
    totalCents: unit.totalCents * input.quantity,
  };
}

/** The part of a line the volume discount applies to (Preise item 6, see config). */
function discountBaseCents(line: WindowLine, cfg: Config): number {
  const u = line.unit;
  let base = u.baseCents + u.fixedGlazingDiscountCents;
  if (cfg.volumeDiscountIncludesExtras) base += u.twoSashSurchargeCents + u.rollerShutterCents;
  return base * line.input.quantity;
}

function priceInstallation(windowCount: number, cfg: Config): Installation {
  const model = cfg.installationModel;
  const flatFeeCents = model === 'perWindow' ? 0 : cents(cfg.installationFlatFeeEur);
  const perWindowCents = model === 'flatFeePlusRemoval' ? 0 : cents(cfg.installationPerWindowEur) * windowCount;
  const removalCents = model === 'flatFeePlusRemoval' ? cents(cfg.removalPerOldWindowEur) * windowCount : 0;
  return { model, flatFeeCents, perWindowCents, removalCents, totalCents: flatFeeCents + perWindowCents + removalCents };
}

function isInServiceArea(postcode: string, cfg: Config): boolean | undefined {
  if (!/^\d{5}$/.test(postcode.trim())) return undefined;
  const n = Number(postcode);
  return n >= cfg.serviceAreaPostcodes.from && n <= cfg.serviceAreaPostcodes.to;
}

export function calculateQuote(order: OrderInput, cfg: Config = defaultConfig): QuoteResult {
  const problems = order.windows
    .map((w, index) => ({ index, problems: checkWindow(w, cfg) }))
    .filter((p) => p.problems.length > 0);
  if (problems.length > 0) return { ok: false, problems };

  const lines = order.windows.map((w) => priceWindow(w, findProduct(w.productId)!, cfg));
  const windowCount = lines.reduce((sum, l) => sum + l.input.quantity, 0);
  const windowsSubtotalCents = lines.reduce((sum, l) => sum + l.totalCents, 0);

  const volumeDiscountCents =
    windowCount >= cfg.volumeDiscountMinWindows
      ? discount(lines.reduce((sum, l) => sum + discountBaseCents(l, cfg), 0), cfg.volumeDiscount)
      : 0;

  const installation = priceInstallation(windowCount, cfg);
  const netCents = windowsSubtotalCents + volumeDiscountCents + installation.totalCents;
  const vatCents = Math.round(netCents * cfg.vatRate);

  const notes: Note[] = [];
  if (order.postcode !== undefined && isInServiceArea(order.postcode, cfg) === false) notes.push('outsideServiceArea');
  if ((order.highestFloor ?? 0) >= cfg.scaffoldingFromFloor) notes.push('scaffoldingPossible');
  if (lines.some((l) => l.needsTwoPersonInstall)) notes.push('twoPersonInstall');
  if (lines.some((l) => l.minAreaApplied)) notes.push('minAreaApplied');

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
