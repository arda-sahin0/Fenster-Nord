import { calculateQuote } from '../pricing/calculate';
import { config } from '../pricing/config';
import { products } from '../pricing/products';
import { toOrder, type AppState } from '../state';
import { formatCents, formatDecimal, formatPercent } from '../ui/format';
import { insulationLabel, problemText } from '../ui/texts';

interface Props {
  state: AppState;
  onSelect: (productId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function SystemStep({ state, onSelect, onBack, onNext }: Props) {
  const options = products
    .map((product) => ({ product, result: calculateQuote(toOrder(state, product.id)) }))
    .sort((a, b) => {
      if (a.result.ok !== b.result.ok) return a.result.ok ? -1 : 1;
      return a.result.ok && b.result.ok ? a.result.quote.grossCents - b.result.quote.grossCents : 0;
    });

  const selected = options.find((o) => o.product.id === state.productId && o.result.ok);

  return (
    <section>
      <h1>Welches Fenster passt zu Ihnen?</h1>
      <p className="lead">
        Die Preise gelten für alle Ihre Fenster zusammen, inklusive Montage und {formatPercent(config.vatRate)} MwSt. Je kleiner der U-Wert, desto
        besser hält das Fenster die Wärme im Haus.
      </p>

      <fieldset className="system-list">
        <legend className="visually-hidden">Fenstersystem</legend>
        {options.map(({ product, result }) => {
          const disabled = !result.ok;
          const checked = state.productId === product.id && !disabled;
          return (
            <label key={product.id} className={`card system ${checked ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}>
              <input
                type="radio"
                name="system"
                value={product.id}
                checked={checked}
                disabled={disabled}
                onChange={() => onSelect(product.id)}
              />
              <span className="system-head">
                <span className="system-name">{product.name}</span>
                {result.ok && <span className="system-price">{formatCents(result.quote.grossCents)}</span>}
              </span>
              <span className="system-facts">
                {product.material} · {product.glazing} verglast
              </span>
              <span className="system-facts">
                {insulationLabel(product.uw)} (U-Wert {formatDecimal(product.uw)})
              </span>
              {result.ok && result.quote.lines[0]?.subsidyEligible && (
                <span className="badge">Evtl. förderfähig (BEG)</span>
              )}
              {!result.ok && (
                <span className="unavailable">
                  Nicht für Ihre Maße:{' '}
                  {result.problems
                    .map((p) => `Fenster ${p.index + 1} ${p.problems.map((x) => problemText(x, product)).join(', ')}`)
                    .join('; ')}
                </span>
              )}
            </label>
          );
        })}
      </fieldset>

      <div className="actions two">
        <button type="button" className="button secondary" onClick={onBack}>
          Zurück
        </button>
        <button type="button" className="button primary" disabled={!selected} onClick={onNext}>
          Weiter
        </button>
      </div>
    </section>
  );
}
