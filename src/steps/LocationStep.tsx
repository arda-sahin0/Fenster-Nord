import { useState } from 'react';
import { isInServiceArea } from '../pricing/calculate';
import { config } from '../pricing/config';
import { floorLabels, noteTexts } from '../ui/texts';

interface Props {
  postcode: string;
  highestFloor: number;
  onChange: (change: { postcode?: string; highestFloor?: number }) => void;
  onBack: () => void;
  onNext: () => void;
}

export function LocationStep({ postcode, highestFloor, onChange, onBack, onNext }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const inArea = isInServiceArea(postcode);
  const valid = inArea !== undefined;

  function next() {
    setSubmitted(true);
    if (valid) onNext();
  }

  return (
    <section>
      <h1>Wo sollen die Fenster eingebaut werden?</h1>
      <p className="lead">Damit prüfen wir, ob Ihr Haus in unserem Montagegebiet liegt und was beim Einbau zu beachten ist.</p>

      <div className="card">
        <div className="field">
          <label htmlFor="postcode">Postleitzahl</label>
          <input
            id="postcode"
            className="postcode"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder="z. B. 22301"
            value={postcode}
            aria-invalid={submitted && !valid ? true : undefined}
            onChange={(e) => onChange({ postcode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
          />
          {submitted && !valid && <p className="error">Bitte eine 5-stellige Postleitzahl eingeben.</p>}
        </div>
        {inArea === false && <p className="notice">{noteTexts.outsideServiceArea.text}</p>}

        <fieldset>
          <legend>In welchem Stockwerk liegt das höchste Fenster?</legend>
          <div className="radio-list">
            {floorLabels.map((label, floor) => (
              <label key={floor} className={`radio ${highestFloor === floor ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="floor"
                  checked={highestFloor === floor}
                  onChange={() => onChange({ highestFloor: floor })}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {highestFloor >= config.scaffoldingFromFloor && <p className="notice">{noteTexts.scaffoldingPossible.text}</p>}
      </div>

      <div className="actions two">
        <button type="button" className="button secondary" onClick={onBack}>
          Zurück
        </button>
        <button type="button" className="button primary" onClick={next}>
          Richtpreis anzeigen
        </button>
      </div>
    </section>
  );
}
