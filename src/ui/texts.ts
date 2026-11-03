// German wording for everything the price engine returns as a code.
import type { Note, Opening, WindowProblem } from '../pricing/calculate';
import { config } from '../pricing/config';
import type { Product } from '../pricing/products';
import type { TimeSlot } from '../state';
import { formatDecimal } from './format';

export const openingLabels: Record<Opening, { title: string; hint: string }> = {
  tiltTurn: { title: 'Dreh-Kipp', hint: 'Zum Öffnen und Kippen – der Standard' },
  fixed: { title: 'Fest verglast', hint: 'Lässt sich nicht öffnen, 15 % günstiger' },
  twoSash: { title: 'Zweiflügelig', hint: 'Zwei Flügel ohne Mittelpfosten' },
};

export const floorLabels = ['Erdgeschoss', '1. Obergeschoss', '2. Obergeschoss', '3. Obergeschoss oder höher'];

export const timeSlotLabels: Record<TimeSlot, string> = {
  morning: 'Vormittags',
  afternoon: 'Nachmittags',
  any: 'Egal',
};

const cm = (mm: number) => `${mm / 10} cm`;

export function problemText(problem: WindowProblem, product?: Product): string {
  switch (problem) {
    case 'unknownProduct':
      return 'Unbekanntes Fenstersystem';
    case 'invalidQuantity':
      return 'Anzahl muss mindestens 1 sein';
    case 'widthTooSmall':
      return `zu schmal (mind. ${cm(product!.widthMinMm)})`;
    case 'widthTooLarge':
      return `zu breit (max. ${cm(product!.widthMaxMm)})`;
    case 'heightTooSmall':
      return `zu niedrig (mind. ${cm(product!.heightMinMm)})`;
    case 'heightTooLarge':
      return `zu hoch (max. ${cm(product!.heightMaxMm)})`;
    case 'twoSashTooNarrow':
      return `zweiflügelig erst ab ${cm(config.twoSashMinWidthMm)} Breite`;
  }
}

export const noteTexts: Record<Note, { title: string; text: string }> = {
  outsideServiceArea: {
    title: 'Außerhalb unseres Montagegebiets',
    text: 'Wir montieren ohne Aufpreis im PLZ-Gebiet 20000 bis 25999. Für Ihre Adresse kommt ein Anfahrtszuschlag dazu, den wir mit Ihnen absprechen. Er ist im Richtpreis nicht enthalten.',
  },
  scaffoldingPossible: {
    title: 'Eventuell Gerüst nötig',
    text: 'Bei Fenstern ab dem 2. Obergeschoss kann ein Gerüst nötig sein. Das klären wir beim Aufmaß. Ein Gerüst ist im Richtpreis nicht enthalten.',
  },
  twoPersonInstall: {
    title: 'Große Fenster',
    text: `Fenster über ${formatDecimal(config.twoPersonInstallAboveM2)} m² bauen wir aus Sicherheitsgründen zu zweit ein. Ob dafür Mehrkosten entstehen, sagen wir Ihnen beim Aufmaß.`,
  },
};

/** Plain-language insulation level for a U-value. Lower Uw = better insulation. */
export function insulationLabel(uw: number): string {
  if (uw <= 0.75) return 'Hervorragende Wärmedämmung';
  if (uw <= 0.85) return 'Sehr gute Wärmedämmung';
  if (uw <= 1.0) return 'Gute Wärmedämmung';
  return 'Einfache Wärmedämmung';
}
