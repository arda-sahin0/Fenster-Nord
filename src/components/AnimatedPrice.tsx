import { useEffect, useState } from 'react';
import { formatCents } from '../ui/format';

const DURATION_MS = 700;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts up to the price. Screen readers get the final price at once through aria-label. */
export function AnimatedPrice({ cents, className }: { cents: number; className?: string }) {
  const [shown, setShown] = useState(reducedMotion ? cents : 0);

  useEffect(() => {
    if (reducedMotion) return setShown(cents);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      setShown(Math.round(cents * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [cents]);

  return (
    <p className={className} aria-label={formatCents(cents)}>
      <span aria-hidden="true">{formatCents(shown)}</span>
    </p>
  );
}
