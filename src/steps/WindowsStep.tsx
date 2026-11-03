import { useState } from 'react';
import { OpeningIcon } from '../components/OpeningIcon';
import type { Opening } from '../pricing/calculate';
import { config } from '../pricing/config';
import { sizeRangeCm, type WindowSpec } from '../state';
import { formatCm, parseCm } from '../ui/format';
import { openingLabels } from '../ui/texts';

interface Props {
  windows: WindowSpec[];
  onChange: (windows: WindowSpec[]) => void;
  onNext: () => void;
}

export function WindowsStep({ windows, onChange, onNext }: Props) {
  // null = editor closed, 'new' = adding, otherwise the id of the window being edited.
  const [editing, setEditing] = useState<string | null>(windows.length === 0 ? 'new' : null);
  const count = windows.reduce((sum, w) => sum + w.quantity, 0);

  function save(spec: WindowSpec) {
    const exists = windows.some((w) => w.id === spec.id);
    onChange(exists ? windows.map((w) => (w.id === spec.id ? spec : w)) : [...windows, spec]);
    setEditing(null);
  }

  return (
    <section>
      <h1>Welche Fenster möchten Sie tauschen?</h1>
      <p className="lead">
        Geben Sie jedes Fenster an. Gleiche Fenster können Sie mit „Anzahl“ zusammenfassen.
      </p>

      <MeasuringHelp />

      {windows.length > 0 && (
        <ul className="window-list">
          {windows.map((w, i) =>
            editing === w.id ? (
              <li key={w.id}>
                <WindowEditor initial={w} title={`Fenster ${i + 1} ändern`} onSave={save} onCancel={() => setEditing(null)} />
              </li>
            ) : (
              <li key={w.id} className="card window-summary">
                <OpeningIcon opening={w.opening} />
                <div className="grow">
                  <strong>
                    {w.quantity > 1 && `${w.quantity} × `}
                    {formatCm(w.widthCm)} × {formatCm(w.heightCm)} cm
                  </strong>
                  <span className="muted">{describeWindow(w)}</span>
                </div>
                {editing === null && (
                  <div className="row-actions">
                    <button type="button" className="link" onClick={() => setEditing(w.id)}>
                      Ändern
                    </button>
                    <button
                      type="button"
                      className="link danger"
                      onClick={() => onChange(windows.filter((x) => x.id !== w.id))}
                    >
                      Entfernen
                    </button>
                  </div>
                )}
              </li>
            ),
          )}
        </ul>
      )}

      {editing === 'new' && (
        <WindowEditor
          title={windows.length === 0 ? 'Erstes Fenster' : 'Weiteres Fenster'}
          onSave={save}
          onCancel={windows.length > 0 ? () => setEditing(null) : undefined}
        />
      )}

      {editing === null && (
        <>
          <button type="button" className="button secondary full" onClick={() => setEditing('new')}>
            + Weiteres Fenster hinzufügen
          </button>
          <div className="actions">
            <button type="button" className="button primary full" disabled={count === 0} onClick={onNext}>
              Weiter zur Auswahl ({count} Fenster)
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export function describeWindow(w: WindowSpec): string {
  const parts = [openingLabels[w.opening].title];
  if (w.rollerShutter) parts.push('mit Rollladen');
  if (w.interiorSill) parts.push('mit Fensterbank innen');
  return parts.join(', ');
}

function MeasuringHelp() {
  return (
    <details className="help">
      <summary>Wie messe ich richtig?</summary>
      <ol>
        <li>Messen Sie Ihr altes Fenster über den ganzen Rahmen, nicht nur die Glasfläche.</li>
        <li>Erst die Breite (links nach rechts), dann die Höhe (unten nach oben).</li>
        <li>Auf den Zentimeter genau reicht. Beim kostenlosen Aufmaß messen wir alles exakt nach.</li>
      </ol>
    </details>
  );
}

interface EditorProps {
  initial?: WindowSpec;
  title: string;
  onSave: (spec: WindowSpec) => void;
  onCancel?: () => void;
}

function WindowEditor({ initial, title, onSave, onCancel }: EditorProps) {
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
  const twoSashMinCm = config.twoSashMinWidthMm / 10;
  const openingError =
    opening === 'twoSash' && !widthError && widthCm < twoSashMinCm
      ? `Zweiflügelige Fenster gibt es erst ab ${twoSashMinCm} cm Breite.`
      : undefined;
  const valid = !widthError && !heightError && !openingError;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!valid) return;
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
        <Field label="Breite" unit="cm" value={width} onChange={setWidth} error={show(width, widthError)} />
        <span className="times" aria-hidden="true">
          ×
        </span>
        <Field label="Höhe" unit="cm" value={height} onChange={setHeight} error={show(height, heightError)} />
      </div>

      <fieldset>
        <legend>Wie soll es sich öffnen lassen?</legend>
        <div className="choice-grid">
          {(Object.keys(openingLabels) as Opening[]).map((o) => (
            <label key={o} className={`choice ${opening === o ? 'selected' : ''}`}>
              <input type="radio" name="opening" value={o} checked={opening === o} onChange={() => setOpening(o)} />
              <OpeningIcon opening={o} />
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
        <Toggle
          label="Neue Fensterbank innen"
          hint="Wird beim Einbau mit montiert"
          checked={interiorSill}
          onChange={setInteriorSill}
        />
      </fieldset>

      <fieldset>
        <legend>Anzahl gleicher Fenster</legend>
        <div className="stepper">
          <button
            type="button"
            aria-label="Eins weniger"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <output aria-live="polite">{quantity}</output>
          <button type="button" aria-label="Eins mehr" onClick={() => setQuantity((q) => Math.min(99, q + 1))}>
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
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

function Field({ label, unit, value, onChange, error }: FieldProps) {
  const id = `field-${label}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-unit">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder={label === 'Breite' ? 'z. B. 120' : 'z. B. 140'}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        <span>{unit}</span>
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
