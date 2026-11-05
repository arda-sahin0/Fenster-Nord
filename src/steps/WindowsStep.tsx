import { useState } from 'react';
import { WindowDrawing } from '../components/WindowDrawing';
import type { WindowSpec } from '../state';
import { formatCm } from '../ui/format';
import { openingLabels } from '../ui/texts';
import { WindowEditor } from './WindowEditor';

interface Props {
  windows: WindowSpec[];
  onChange: (windows: WindowSpec[]) => void;
  onNext: () => void;
}

export function WindowsStep({ windows, onChange, onNext }: Props) {
  // null = editor closed, 'new' = adding, otherwise the id of the window being edited.
  const [openEditor, setEditing] = useState<string | null>(null);
  // An empty list always shows the editor, also after removing the last window or restarting on this screen.
  const editing = windows.length === 0 ? 'new' : openEditor;
  const count = windows.reduce((sum, w) => sum + w.quantity, 0);

  function save(spec: WindowSpec) {
    const exists = windows.some((w) => w.id === spec.id);
    onChange(exists ? windows.map((w) => (w.id === spec.id ? spec : w)) : [...windows, spec]);
    setEditing(null);
  }

  return (
    <section>
      <h1>Welche Fenster möchten Sie tauschen?</h1>
      <p className="lead">Geben Sie jedes Fenster an. Gleiche Fenster können Sie mit „Anzahl“ zusammenfassen.</p>

      <details className="help">
        <summary>Wie messe ich richtig?</summary>
        <ol>
          <li>Messen Sie Ihr altes Fenster über den ganzen Rahmen, nicht nur die Glasfläche.</li>
          <li>Erst die Breite (links nach rechts), dann die Höhe (unten nach oben).</li>
          <li>Auf den Zentimeter genau reicht. Beim kostenlosen Aufmaß messen wir alles exakt nach.</li>
        </ol>
      </details>

      {windows.length > 0 && (
        <ul className="window-list">
          {windows.map((w, i) =>
            editing === w.id ? (
              <li key={w.id}>
                <WindowEditor initial={w} title={`Fenster ${i + 1} ändern`} onSave={save} onCancel={() => setEditing(null)} />
              </li>
            ) : (
              <li key={w.id} className="card window-summary">
                <WindowDrawing opening={w.opening} size={48} widthCm={w.widthCm} heightCm={w.heightCm} rollerShutter={w.rollerShutter} />
                <div className="grow">
                  <strong>
                    {formatCm(w.widthCm)} × {formatCm(w.heightCm)} cm{w.quantity > 1 && ` (${w.quantity} Stück)`}
                  </strong>
                  <span className="muted">{describeWindow(w)}</span>
                </div>
                {editing === null && (
                  <div className="row-actions">
                    <button type="button" className="link" onClick={() => setEditing(w.id)}>
                      Ändern
                    </button>
                    <button type="button" className="link danger" onClick={() => onChange(windows.filter((x) => x.id !== w.id))}>
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

function describeWindow(w: WindowSpec): string {
  const parts = [openingLabels[w.opening].title];
  if (w.rollerShutter) parts.push('mit Rollladen');
  if (w.interiorSill) parts.push('mit Fensterbank innen');
  return parts.join(', ');
}
