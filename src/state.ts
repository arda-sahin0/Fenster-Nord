import type { Opening, OrderInput } from './pricing/calculate';
import { products } from './pricing/products';

export type Step = 'windows' | 'system' | 'location' | 'result' | 'contact' | 'summary';

/** One window as the customer enters it. The system is chosen once for the whole order. */
export interface WindowSpec {
  id: string;
  widthCm: number;
  heightCm: number;
  quantity: number;
  opening: Opening;
  rollerShutter: boolean;
  interiorSill: boolean;
}

export type TimeSlot = 'morning' | 'afternoon' | 'any';

export interface Contact {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  timeSlot: TimeSlot;
  message: string;
  consent: boolean;
}

export interface AppState {
  step: Step;
  windows: WindowSpec[];
  productId?: string;
  postcode: string;
  /** Highest floor with a window: 0 = ground floor, 3 = 3rd floor or higher. */
  highestFloor: number;
  contact: Contact;
}

export const initialState: AppState = {
  step: 'windows',
  windows: [],
  postcode: '',
  highestFloor: 0,
  contact: { name: '', phone: '', email: '', street: '', city: '', timeSlot: 'any', message: '', consent: false },
};

export function toOrder(state: AppState, productId: string): OrderInput {
  return {
    windows: state.windows.map((w) => ({
      productId,
      widthMm: Math.round(w.widthCm * 10),
      heightMm: Math.round(w.heightCm * 10),
      quantity: w.quantity,
      opening: w.opening,
      rollerShutter: w.rollerShutter,
      interiorSill: w.interiorSill,
    })),
    postcode: state.postcode || undefined,
    highestFloor: state.highestFloor,
  };
}

/** Largest range any system covers, in cm. Used to check sizes before a system is chosen. */
export const sizeRangeCm = {
  widthMin: Math.min(...products.map((p) => p.widthMinMm)) / 10,
  widthMax: Math.max(...products.map((p) => p.widthMaxMm)) / 10,
  heightMin: Math.min(...products.map((p) => p.heightMinMm)) / 10,
  heightMax: Math.max(...products.map((p) => p.heightMaxMm)) / 10,
};

// Progress is kept in the browser, so a reload on the phone does not lose the entered windows.
const STORAGE_KEY = 'fenster-nord-v1';

export function loadState(): AppState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<AppState> | null;
    if (!saved || !Array.isArray(saved.windows)) return initialState;
    return { ...initialState, ...saved, contact: { ...initialState.contact, ...saved.contact } };
  } catch {
    return initialState;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or storage full: the app still works, it just forgets on reload.
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // See saveState.
  }
}
