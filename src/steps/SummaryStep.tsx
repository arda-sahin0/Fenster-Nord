import { Breakdown } from '../components/Breakdown';
import type { Quote } from '../pricing/calculate';
import type { AppState } from '../state';
import { formatCents } from '../ui/format';
import { floorLabels, noteTexts, timeSlotLabels } from '../ui/texts';

interface Props {
  state: AppState;
  quote: Quote;
  onRestart: () => void;
}

export function SummaryStep({ state, quote, onRestart }: Props) {
  const c = state.contact;
  const product = quote.lines[0]!.product;

  return (
    <section>
      <div className="success">
        <h1>Vielen Dank für Ihre Anfrage!</h1>
        <p>
          Wir melden uns telefonisch bei Ihnen, um einen Termin für das kostenlose Aufmaß zu vereinbaren.
        </p>
        <p className="demo-note">Demo: Diese Anfrage wurde nicht verschickt.</p>
      </div>

      <h2>Ihre Anfrage</h2>
      <dl className="card summary">
        <dt>Name</dt>
        <dd>{c.name}</dd>
        <dt>Telefon</dt>
        <dd>{c.phone}</dd>
        {c.email && (
          <>
            <dt>E-Mail</dt>
            <dd>{c.email}</dd>
          </>
        )}
        <dt>Adresse</dt>
        <dd>
          {c.street}, {state.postcode} {c.city}
        </dd>
        <dt>Höchstes Fenster</dt>
        <dd>{floorLabels[state.highestFloor]}</dd>
        <dt>Wunschzeit</dt>
        <dd>{timeSlotLabels[c.timeSlot]}</dd>
        {c.message && (
          <>
            <dt>Nachricht</dt>
            <dd>{c.message}</dd>
          </>
        )}
        <dt>Fenstersystem</dt>
        <dd>
          {product.name} ({product.id})
        </dd>
        <dt>Richtpreis</dt>
        <dd>
          <strong>{formatCents(quote.grossCents)}</strong> inkl. Montage und MwSt.
        </dd>
      </dl>

      {quote.notes.length > 0 && (
        <>
          <h2>Klären wir beim Aufmaß</h2>
          <ul className="facts">
            {quote.notes.map((n) => (
              <li key={n}>{noteTexts[n].title}</li>
            ))}
          </ul>
        </>
      )}

      <h2>Preisaufstellung</h2>
      <Breakdown quote={quote} />

      <div className="actions two no-print">
        <button type="button" className="button secondary" onClick={() => window.print()}>
          Drucken / PDF
        </button>
        <button type="button" className="button secondary" onClick={onRestart}>
          Neue Berechnung
        </button>
      </div>
    </section>
  );
}
