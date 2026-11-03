import type { Quote, WindowLine } from '../pricing/calculate';
import { config } from '../pricing/config';
import { formatCents, formatCm, formatDecimal, formatEur } from '../ui/format';
import { openingLabels } from '../ui/texts';

/** The full price breakdown: every amount with the rule that produced it. */
export function Breakdown({ quote }: { quote: Quote }) {
  const percent = (rate: number) => `${Math.round(rate * 100)} %`;
  const inst = quote.installation;

  return (
    <div className="breakdown">
      {quote.lines.map((line, i) => (
        <LineBlock key={i} line={line} index={i} />
      ))}

      <table>
        <tbody>
          {quote.volumeDiscountCents !== 0 && (
            <Row
              label={`Mengenrabatt ${percent(config.volumeDiscount)}`}
              detail={`ab ${config.volumeDiscountMinWindows} Fenstern, auf den Fensterpreis inkl. Öffnungsart`}
              cents={quote.volumeDiscountCents}
            />
          )}
          <Row label="Montagepauschale je Auftrag" detail="Anfahrt, Baustelleneinrichtung, Abdeckarbeiten" cents={inst.flatFeeCents} />
          <Row
            label="Ausbau und Entsorgung der Altfenster"
            detail={`${quote.windowCount} × ${formatEur(config.removalPerOldWindowEur)}`}
            cents={inst.removalCents}
          />
          <Row label="Summe netto" cents={quote.netCents} className="subtotal" />
          <Row label={`MwSt. ${percent(config.vatRate)}`} cents={quote.vatCents} />
          <Row label="Richtpreis inkl. MwSt." cents={quote.grossCents} className="total" />
        </tbody>
      </table>
    </div>
  );
}

function LineBlock({ line, index }: { line: WindowLine; index: number }) {
  const { unit, input, product } = line;
  const widthM = input.widthMm / 1000;
  const size = `${formatCm(input.widthMm / 10)} × ${formatCm(input.heightMm / 10)} cm`;

  const title = `Fenster ${index + 1}: ${input.quantity > 1 ? `${input.quantity} × ` : ''}${size}, ${openingLabels[input.opening].title}`;

  // Title outside the table, so it sits above the white box instead of inside it.
  return (
    <>
      <h3 className="line-title">{title}</h3>
      {line.needsTwoPersonInstall && (
        <p className="line-note">
          Großes Element über {formatDecimal(config.twoPersonInstallAboveM2)} m²: Den endgültigen Preis legen wir beim Aufmaß fest.
        </p>
      )}
      <table aria-label={title}>
        <tbody>
          <Row
            label={product.name}
            detail={
              line.minAreaApplied
                ? `${formatDecimal(line.areaM2)} m², berechnet mit Mindestfläche ${formatDecimal(line.chargedAreaM2)} m² × ${formatEur(product.pricePerM2Eur)}/m²`
                : `${formatDecimal(line.areaM2)} m² × ${formatEur(product.pricePerM2Eur)}/m²`
            }
            cents={unit.baseCents}
          />
          {unit.fixedGlazingDiscountCents !== 0 && (
            <Row
              label="Nachlass Festverglasung"
              detail={`${Math.round(config.fixedGlazingDiscount * 100)} % auf den Fensterpreis`}
              cents={unit.fixedGlazingDiscountCents}
            />
          )}
          {unit.twoSashSurchargeCents !== 0 && (
            <Row label="Aufpreis zweiflügelig" cents={unit.twoSashSurchargeCents} />
          )}
          {unit.rollerShutterCents !== 0 && (
            <Row
              label="Rollladen"
              detail={`${formatDecimal(widthM)} m × ${formatEur(config.rollerShutterEurPerM)}/m`}
              cents={unit.rollerShutterCents}
            />
          )}
          {unit.interiorSillCents !== 0 && (
            <Row
              label="Fensterbank innen"
              detail={`${formatDecimal(widthM)} m × ${formatEur(config.interiorSillEurPerM)}/m`}
              cents={unit.interiorSillCents}
            />
          )}
          {input.quantity > 1 && (
            <Row
              label={`${input.quantity} Stück`}
              detail={`${input.quantity} × ${formatCents(unit.totalCents)}`}
              cents={line.totalCents}
              className="subtotal"
            />
          )}
        </tbody>
      </table>
    </>
  );
}

interface RowProps {
  label: string;
  detail?: string;
  cents: number;
  className?: string;
}

function Row({ label, detail, cents, className }: RowProps) {
  return (
    <tr className={className}>
      <th scope="row">
        {label}
        {detail && <span className="detail">{detail}</span>}
      </th>
      <td>{formatCents(cents)}</td>
    </tr>
  );
}
