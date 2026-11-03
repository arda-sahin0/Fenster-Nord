// All prices and business rules in one place.
// Sources: Preise = Fenster-Nord_Preise-und-Produkte.pdf, Montage = Fenster-Nord_Montagebedingungen.pdf,
// Antwort = answers from Fenster Nord to my questions (2026-11-03). Details: docs/document-review.md.

export const config = {
  /** Preise item 2: smaller windows are charged as this area. */
  minChargedAreaM2: 0.8,

  /** Preise item 3: fixed glazing gets this discount on the window price. */
  fixedGlazingDiscount: 0.15,
  /** Preise item 3: surcharge per two-sash window. */
  twoSashSurchargeEur: 120,
  /** Own assumption: the documents give no minimum width (review item 11). */
  twoSashMinWidthMm: 800,

  /** Preise item 4: roller shutter per metre of window width. */
  rollerShutterEurPerM: 95,
  /** Montage §2: interior window sill per metre. */
  interiorSillEurPerM: 38,

  /** Montage §2, confirmed by Antwort: flat fee per order plus removal per old window.
   *  The 180 € per window in Preise item 5 is out of date. */
  installationFlatFeeEur: 450,
  removalPerOldWindowEur: 60,

  /** Preise item 6: from this many windows per order ... */
  volumeDiscountMinWindows: 10,
  /** ... this discount. Antwort: on the window price including opening type (fixed-glazing
   *  discount, two-sash surcharge), not on roller shutter, sill or installation. */
  volumeDiscount: 0.05,

  /** Preise: all prices are net. Antwort: show them incl. VAT. */
  vatRate: 0.19,

  /** Montage §3: above this area, two installers are needed.
   *  Antwort: no fixed surcharge; the price for such elements is set during the on-site measurement. */
  twoPersonInstallAboveM2: 3.0,
  /** Montage §4: installation without surcharge in this postcode range. */
  serviceAreaPostcodes: { from: 20000, to: 25999 },
  /** Montage §5: from this floor up, scaffolding may be needed. */
  scaffoldingFromFloor: 2,

  /** BEG limit for windows. Antwort: show the subsidy note only up to this value, without an amount. */
  subsidyMaxUw: 0.95,
};
