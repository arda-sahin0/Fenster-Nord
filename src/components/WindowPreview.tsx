import type { Opening } from '../pricing/calculate';
import { formatCm, formatDecimal } from '../ui/format';

interface Props {
  widthCm: number;
  heightCm: number;
  opening: Opening;
  rollerShutter: boolean;
}

const BOX = 150; // largest side of the drawing in px

/** True-to-proportion drawing of the window being entered. */
export function WindowPreview({ widthCm, heightCm, opening, rollerShutter }: Props) {
  const valid = widthCm > 0 && heightCm > 0;
  // Placeholder proportions until both sizes are entered.
  const ratio = valid ? widthCm / heightCm : 120 / 140;
  const w = ratio >= 1 ? BOX : BOX * ratio;
  const h = ratio >= 1 ? BOX / ratio : BOX;
  const shutter = rollerShutter ? 14 : 0;
  const pad = 8;
  const x = pad + (BOX - w) / 2;
  const y = pad + shutter;
  const inset = 7;
  const gx = x + inset;
  const gy = y + inset;
  const gw = w - 2 * inset;
  const gh = h - 2 * inset;
  const mid = gx + gw / 2;

  // Turn symbol: lines from the handle side to the middle of the hinge side.
  const swing = (hingeX: number, handleX: number) => (
    <polyline points={`${handleX},${gy} ${hingeX},${gy + gh / 2} ${handleX},${gy + gh}`} className="swing" />
  );

  return (
    <figure className={`window-preview ${valid ? '' : 'placeholder'}`} aria-hidden="true">
      <svg viewBox={`0 0 ${BOX + 2 * pad} ${BOX + 2 * pad + 14}`} width={BOX + 2 * pad}>
        {rollerShutter && <rect x={x - 2} y={pad} width={w + 4} height={shutter} rx="3" className="shutter" />}
        <rect x={x} y={y} width={w} height={h} rx="4" className="frame" />
        {opening === 'twoSash' ? (
          <>
            <rect x={gx} y={gy} width={gw / 2} height={gh} className="glass" />
            <rect x={mid} y={gy} width={gw / 2} height={gh} className="glass" />
            {swing(gx, mid)}
            {swing(gx + gw, mid)}
          </>
        ) : (
          <>
            <rect x={gx} y={gy} width={gw} height={gh} className="glass" />
            {opening === 'tiltTurn' && (
              <>
                {swing(gx, gx + gw)}
                <polyline points={`${gx},${gy + gh} ${mid},${gy} ${gx + gw},${gy + gh}`} className="swing" />
              </>
            )}
          </>
        )}
        <rect x={gx + 4} y={gy + 4} width={Math.max(gw * 0.25, 6)} height={4} rx="2" className="shine" />
      </svg>
      <figcaption>
        {valid ? (
          <>
            {formatCm(widthCm)} × {formatCm(heightCm)} cm · {formatDecimal((widthCm * heightCm) / 10000)} m²
          </>
        ) : (
          'Vorschau erscheint bei Eingabe'
        )}
      </figcaption>
    </figure>
  );
}
