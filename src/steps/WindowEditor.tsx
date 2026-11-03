import { useState } from 'react';
import { WindowDrawing } from '../components/WindowDrawing';
import type { Opening } from '../pricing/calculate';
import { config } from '../pricing/config';
import { sizeRangeCm, type WindowSpec } from '../state';
import { formatCm, formatDecimal, parseCm } from '../ui/format';
import { openingLabels } from '../ui/texts';

interface Props {
  initial?: WindowSpec;
  title: string;
  onSave: (spec: WindowSpec) => void;
  onCancel?: () => void;
}

/** Form for one window: size, opening type, extras, quantity. */
export function WindowEditor({ initial, title, onSave, onCancel }: Props) {
  const [width, setWidth] = useState(initial ? String(initial.widthCm).replace('.', ',') : '');
  const [height, setHeight] = useState(initial ? String(initial.heightCm).replace('.', ',') : '');
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [opening, setOpening] = useState<Opening>(initial?.opening ?? 'tiltTurn');
  const [rollerShutter, setRollerShutter] = useState(initial?.rollerShutter ?? false);
  const [interiorSill, setInteriorSill] = useState(initial?.interiorSill ?? false);
  const [submitted, setSubmitted] = useState(false);

  const widthCm = parseCm(width);
  const heightCm = parseCm(height);
  const r = sizeRangeCm;
  const widthError = sizeError(widthCm, r.widthMin, r.widthMax, 'Breite');
  const heightError = sizeError(heightCm, r.heightMin, r.heightMax, 'Höhe');
  const sizeValid = !widthError && !heightError;
  const twoSashMinCm = config.twoSashMinWidthMm / 10;
  const openingError =
    opening === 'twoSash' && !widthError && widthCm < twoSashMinCm
      ? `Zweiflügelige Fenster gibt es erst ab ${twoSashMinCm} cm Breite.`
      : undefined;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!sizeValid || openingError) return;
    onSave({
      // Not crypto.randomUUID(): it only exists on HTTPS, and phone tests over the local network use HTTP.
      id: initial?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      widthCm,
      heightCm,
      quantity,
      opening,
      rollerShutter,
      interiorSill,
    });
  }

  // Show errors once a field has a value or after the first save attempt.
  const show = (value: string, error?: string) => (submitted || value !== '' ? error : undefined);

  return (
    <form className="card editor" onSubmit={submit} noValidate>
      <h2>{title}</h2>

      <div className="size-row">
        <Field id="width" label="Breite" placeholder="z. B. 120" value={width} onChange={setWidth} error={show(width, widthError)} />
        <span className="times" aria-hidden="true">
          ×
        </span>
        <Field id="height" label="Höhe" placeholder="z. B. 140" value={height} onChange={setHeight} error={show(height, heightError)} />
      </div>

      <figure className={`window-preview ${sizeValid ? '' : 'placeholder'}`} aria-hidden="true">
        <WindowDrawing
          opening={opening}
          size={150}
          widthCm={sizeValid ? widthCm : undefined}
          heightCm={sizeValid ? heightCm : undefined}
          rollerShutter={rollerShutter}
        />
        <figcaption>
          {sizeValid
            ? `${formatCm(widthCm)} × ${formatCm(heightCm)} cm · ${formatDecimal((widthCm * heightCm) / 10000)} m²`
            : 'Vorschau erscheint bei Eingabe'}
        </figcaption>
      </figure>

      <fieldset>
        <legend>Wie soll es sich öffnen lassen?</legend>
        <div className="choice-grid">
          {(Object.keys(openingLabels) as Opening[]).map((o) => (
            <label key={o} className={`choice ${opening === o ? 'selected' : ''}`}>
              <input type="radio" name="opening" value={o} checked={opening === o} onChange={() => setOpening(o)} />
              <WindowDrawing opening={o} size={52} />
              <span className="choice-title">{openingLabels[o].title}</span>
              <span className="choice-hint">{openingLabels[o].hint}</span>
            </label>
          ))}
        </div>
        {openingError && <p className="error">{openingError}</p>}
      </fieldset>

      <fieldset>
        <legend>Extras</legend>
        <Toggle
          label="Rollladen"
          hint="Aufsatzrollladen mit Gurt, sitzt oben auf dem Fenster"
          checked={rollerShutter}
          onChange={setRollerShutter}
        />
        <Toggle label="Neue Fensterbank innen" hint="Wird beim Einbau mit montiert" checked={interiorSill} onChange={setInteriorSill} />
      </fieldset>

      <fieldset>
        <legend>Anzahl gleicher Fenster</legend>
        <div className="stepper">
          <button type="button" aria-label="Eins weniger" disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)}>
            −
          </button>
          <output aria-live="polite">{quantity}</output>
          <button type="button" aria-label="Eins mehr" disabled={quantity >= 99} onClick={() => setQuantity((q) => q + 1)}>
            +
          </button>
        </div>
      </fieldset>

      <div className="editor-actions">
        {onCancel && (
          <button type="button" className="button secondary" onClick={onCancel}>
            Abbrechen
          </button>
        )}
        <button type="submit" className="button primary grow">
          Fenster speichern
        </button>
      </div>
    </form>
  );
}

function sizeError(cm: number, min: number, max: number, name: string): string | undefined {
  if (Number.isNaN(cm)) return `Bitte ${name} in cm eingeben, z. B. 120.`;
  if (cm < min) return `${name} mindestens ${min} cm.`;
  if (cm > max) return `${name} höchstens ${max} cm.`;
  return undefined;
}

interface FieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

/** Number field in cm. */
function Field({ id, label, placeholder, value, onChange, error }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-unit">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        <span>cm</span>
      </div>
      {error && (
        <p className="error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

interface ToggleProps {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ label, hint, checked, onChange }: ToggleProps) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-text">
        <span>{label}</span>
        <span className="choice-hint">{hint}</span>
      </span>
    </label>
  );
}
