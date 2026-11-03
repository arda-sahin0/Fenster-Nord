import type { Opening } from '../pricing/calculate';

// Simple window drawings. Lines show how a sash opens: turn (apex at the hinge side) and tilt (apex at the top).
export function OpeningIcon({ opening }: { opening: Opening }) {
  return (
    <svg viewBox="0 0 48 60" width="48" height="60" aria-hidden="true" className="opening-icon">
      <rect x="2" y="2" width="44" height="56" rx="2" className="frame" />
      {opening === 'fixed' && <rect x="7" y="7" width="34" height="46" className="glass" />}
      {opening === 'tiltTurn' && (
        <>
          <rect x="7" y="7" width="34" height="46" className="glass" />
          <polyline points="41,7 7,30 41,53" className="swing" />
          <polyline points="7,53 24,7 41,53" className="swing" />
        </>
      )}
      {opening === 'twoSash' && (
        <>
          <rect x="7" y="7" width="17" height="46" className="glass" />
          <rect x="24" y="7" width="17" height="46" className="glass" />
          <polyline points="24,7 7,30 24,53" className="swing" />
          <polyline points="24,7 41,30 24,53" className="swing" />
        </>
      )}
    </svg>
  );
}
