import { useEffect, useState } from 'react';
import { calculateQuote } from './pricing/calculate';
import { clearState, initialState, loadState, saveState, toOrder, type AppState, type Step } from './state';
import { ContactStep } from './steps/ContactStep';
import { LocationStep } from './steps/LocationStep';
import { ResultStep } from './steps/ResultStep';
import { SummaryStep } from './steps/SummaryStep';
import { SystemStep } from './steps/SystemStep';
import { WindowsStep } from './steps/WindowsStep';

const progressSteps: { step: Step; label: string }[] = [
  { step: 'windows', label: 'Fenster' },
  { step: 'system', label: 'Auswahl' },
  { step: 'location', label: 'Ort' },
  { step: 'result', label: 'Preis' },
  { step: 'contact', label: 'Anfrage' },
];

export function App() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => saveState(state), [state]);

  const update = (change: Partial<AppState>) => setState((s) => ({ ...s, ...change }));
  const go = (step: Step) => {
    update({ step });
    window.scrollTo({ top: 0 });
  };

  const result = state.productId ? calculateQuote(toOrder(state, state.productId)) : undefined;
  const quote = result?.ok ? result.quote : undefined;

  // Later steps need a valid price. If the windows changed and no longer fit the system, go back to the choice.
  let step = state.step;
  if (state.windows.length === 0) step = 'windows';
  else if (!quote && step !== 'windows') step = 'system';

  const progressIndex = progressSteps.findIndex((p) => p.step === step);

  return (
    <>
      <header className="site-header">
        <div className="brand">
          <span className="logo" aria-hidden="true" />
          <span>
            <strong>Fenster Nord</strong>
            <span className="tagline">Richtpreis-Rechner</span>
          </span>
        </div>
      </header>

      {step !== 'summary' && (
        <nav className="progress" aria-label="Fortschritt">
          <ol>
            {progressSteps.map((p, i) => (
              <li
                key={p.step}
                className={i < progressIndex ? 'done' : i === progressIndex ? 'current' : ''}
                aria-current={i === progressIndex ? 'step' : undefined}
              >
                <span className="dot">{i + 1}</span>
                <span className="label">{p.label}</span>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <main>
        {step === 'windows' && (
          <WindowsStep windows={state.windows} onChange={(windows) => update({ windows })} onNext={() => go('system')} />
        )}
        {step === 'system' && (
          <SystemStep
            state={state}
            onSelect={(productId) => update({ productId })}
            onBack={() => go('windows')}
            onNext={() => go('location')}
          />
        )}
        {step === 'location' && (
          <LocationStep
            postcode={state.postcode}
            highestFloor={state.highestFloor}
            onChange={update}
            onBack={() => go('system')}
            onNext={() => go('result')}
          />
        )}
        {step === 'result' && quote && (
          <ResultStep
            quote={quote}
            onEditWindows={() => go('windows')}
            onBack={() => go('location')}
            onNext={() => go('contact')}
          />
        )}
        {step === 'contact' && (
          <ContactStep
            contact={state.contact}
            postcode={state.postcode}
            onChange={(contact) => update({ contact })}
            onBack={() => go('result')}
            onSubmit={() => go('summary')}
          />
        )}
        {step === 'summary' && quote && (
          <SummaryStep
            state={state}
            quote={quote}
            onRestart={() => {
              clearState();
              setState(initialState);
              window.scrollTo({ top: 0 });
            }}
          />
        )}
      </main>

      <footer className="site-footer">
        Fenster Nord GmbH · Musterstraße 1 · 22000 Hamburg
        <br />
        Fiktives Unternehmen für eine Bewerbungsaufgabe. Alle Preise unverbindlich.
      </footer>
    </>
  );
}
