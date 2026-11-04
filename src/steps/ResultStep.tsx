import { AnimatedPrice } from '../components/AnimatedPrice';
import { Breakdown } from '../components/Breakdown';
import type { Quote } from '../pricing/calculate';
import { config } from '../pricing/config';
import { formatDecimal, formatPercent } from '../ui/format';
import { noteTexts } from '../ui/texts';

interface Props {
  quote: Quote;
  onEditWindows: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function ResultStep({ quote, onEditWindows, onBack, onNext }: Props) {
  const product = quote.lines[0]!.product;

  return (
    <section>
      <div className="result-hero">
        <p className="eyebrow">Ihr unverbindlicher Richtpreis</p>
        <AnimatedPrice className="result-price" cents={quote.grossCents} />
        <p className="result-sub">
          {quote.windowCount} Fenster {product.name} · inkl. Montage und {formatPercent(config.vatRate)} MwSt.
        </p>
      </div>

      <button type="button" className="button primary full" onClick={onNext}>
        Kostenloses Aufmaß anfragen
      </button>

      {quote.notes.length > 0 && (
        <div className="notes">
          {quote.notes.map((n) => (
            <div key={n} className="notice">
              <strong>{noteTexts[n].title}</strong>
              <p>{noteTexts[n].text}</p>
            </div>
          ))}
        </div>
      )}

      <h2>So setzt sich der Preis zusammen</h2>
      <Breakdown quote={quote} />

      {quote.lines[0]!.subsidyEligible && (
        <div className="info">
          <strong>Förderung</strong>
          <p>
            {product.name} hat einen U-Wert von {formatDecimal(product.uw)} und erfüllt damit den Grenzwert der
            Bundesförderung für effiziente Gebäude (BEG) von höchstens {formatDecimal(config.subsidyMaxUw)}. Ob Sie
            einen Zuschuss bekommen, hängt von weiteren Bedingungen ab: Unter anderem muss ein Energieberater beteiligt
            sein, und der Antrag muss vor der Auftragsvergabe gestellt werden. Der Richtpreis enthält keinen Zuschuss.{' '}
            <a href="https://www.bafa.de" target="_blank" rel="noreferrer">
              Mehr beim BAFA
            </a>
          </p>
        </div>
      )}

      <h2>Gut zu wissen</h2>
      <ul className="facts">
        <li>Der Preis ist unverbindlich. Vor dem Auftrag kommt ein Mitarbeiter zum Aufmaß vorbei – kostenlos.</li>
        <li>Lieferzeit ab Aufmaß: in der Regel 6 bis 8 Wochen.</li>
        <li>Farbe Weiß ist im Preis enthalten. Andere Farben und Dekore auf Anfrage.</li>
        <li>
          Die Montage umfasst Ausbau und Entsorgung der alten Fenster, Einbau nach RAL-Leitfaden mit Abdichtung und
          das Beiputzen der Laibungen. Malerarbeiten sind nicht enthalten.
        </li>
      </ul>

      <button type="button" className="button primary full" onClick={onNext}>
        Kostenloses Aufmaß anfragen
      </button>
      <div className="actions two">
        <button type="button" className="button secondary" onClick={onBack}>
          Zurück
        </button>
        <button type="button" className="button secondary" onClick={onEditWindows}>
          Fenster ändern
        </button>
      </div>
    </section>
  );
}
