// All prices and business rules in one place.
// Sources: Preise = Fenster-Nord_Preise-und-Produkte.pdf, Montage = Fenster-Nord_Montagebedingungen.pdf.
// Items marked OPEN are not settled by the documents; see docs/document-review.md.

export type InstallationModel =
  /** Preise item 5: 180 € per window, removal and disposal included. */
  | 'perWindow'
  /** Montage §2: 450 € flat fee per order + 60 € per old window. */
  | 'flatFeePlusRemoval'
  /** Both combined: 450 € flat fee + 180 € per window. */
  | 'flatFeePlusPerWindow';

export const config = {
  /** Preise item 2: smaller windows are charged as this area. */
  minChargedAreaM2: 0.8,

  /** Preise item 3: fixed glazing gets this discount on the window price. */
  fixedGlazingDiscount: 0.15,
  /** Preise item 3: surcharge per two-sash window. */
  twoSashSurchargeEur: 120,
  /** OPEN (review item 11): no minimum width given. Own assumption. */
  twoSashMinWidthMm: 800,

  /** Preise item 4: roller shutter per metre of window width. */
  rollerShutterEurPerM: 95,
  /** Montage §2: interior window sill per metre. OPEN (review item 6): unclear if offered. */
  interiorSillEurPerM: 38,

  /** OPEN (review item 1): which installation price applies. */
  installationModel: 'perWindow' as InstallationModel,
  installationPerWindowEur: 180,
  installationFlatFeeEur: 450,
  removalPerOldWindowEur: 60,

  /** Preise item 6: from this many windows per order ... */
  volumeDiscountMinWindows: 10,
  /** ... this discount on the window prices, never on installation. */
  volumeDiscount: 0.05,
  /** OPEN (review item 5): does the discount also cover two-sash surcharge and roller shutter? */
  volumeDiscountIncludesExtras: false,

  /** Preise: all prices are net. German VAT for windows. */
  vatRate: 0.19,

  /** Montage §3: above this area, two installers are needed. OPEN (review item 4): no price. */
  twoPersonInstallAboveM2: 3.0,
  /** Montage §4: installation without surcharge in this postcode range. */
  serviceAreaPostcodes: { from: 20000, to: 25999 },
  /** Montage §5: from this floor up, scaffolding may be needed. */
  scaffoldingFromFloor: 2,

  /** OPEN (review item 2): BEG requires Uw ≤ 0.95. Verify on bafa.de. */
  subsidyMaxUw: 0.95,
};

export type Config = typeof config;
