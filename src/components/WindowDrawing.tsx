import type { Opening } from '../pricing/calculate';

interface Props {
  opening: Opening;
  /** Longest side of the drawing in px. */
  size: number;
  /** Real size for true proportions. Without it, a typical upright window is drawn. */
  widthCm?: number;
  heightCm?: number;
  rollerShutter?: boolean;
}

const EDGE = 2; // room for the frame stroke

/** A window drawn to scale. Dashed lines show how a sash opens; as in German window drawings, the point of each
 *  triangle is on the hinge side: at the side for turning, at the bottom for tilting. */
export function WindowDrawing({ opening, size, widthCm, heightCm, rollerShutter = false }: Props) {
  const ratio = widthCm && heightCm ? widthCm / heightCm : 0.8;
  const w = ratio >= 1 ? size : size * ratio;
  const h = ratio >= 1 ? size / ratio : size;
  const shutter = rollerShutter ? size * 0.09 : 0;

  const x = EDGE + (size - w) / 2;
  const y = EDGE + shutter;
  const inset = 2 + size * 0.05;
  const gx = x + inset;
  const gy = y + inset;
  const gw = w - 2 * inset;
  const gh = h - 2 * inset;
  const mid = gx + gw / 2;

  const turn = (hingeX: number, handleX: number) => (
    <polyline points={`${handleX},${gy} ${hingeX},${gy + gh / 2} ${handleX},${gy + gh}`} className="swing" />
  );

  return (
    <svg
      className="window-drawing"
      viewBox={`0 0 ${size + 2 * EDGE} ${y + h + EDGE}`}
      width={size + 2 * EDGE}
      aria-hidden="true"
    >
      {rollerShutter && <rect x={x - 2} y={EDGE} width={w + 4} height={shutter} rx="3" className="shutter" />}
      <rect x={x} y={y} width={w} height={h} rx="3" className="frame" />
      {opening === 'twoSash' ? (
        <>
          <rect x={gx} y={gy} width={gw / 2} height={gh} className="glass" />
          <rect x={mid} y={gy} width={gw / 2} height={gh} className="glass" />
          {turn(gx, mid)}
          {turn(gx + gw, mid)}
        </>
      ) : (
        <>
          <rect x={gx} y={gy} width={gw} height={gh} className="glass" />
          {opening === 'tiltTurn' && (
            <>
              {turn(gx, gx + gw)}
              <polyline points={`${gx},${gy} ${mid},${gy + gh} ${gx + gw},${gy}`} className="swing" />
            </>
          )}
        </>
      )}
    </svg>
  );
}
