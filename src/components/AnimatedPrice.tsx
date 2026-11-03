import { useEffect, useState } from 'react';
import { formatCents } from '../ui/format';

const DURATION_MS = 700;

/** Counts up to the price once. Shows it at once if the user prefers reduced motion. */
export function AnimatedPrice({ cents, className }: { cents: number; className?: string }) {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [shown, setShown] = useState(reduced ? cents : 0);

  useEffect(() => {
    if (reduced) {
      setShown(cents);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(cents * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [cents, reduced]);

  return (
    <p className={className} aria-label={formatCents(cents)}>
      <span aria-hidden="true">{formatCents(shown)}</span>
    </p>
  );
}
