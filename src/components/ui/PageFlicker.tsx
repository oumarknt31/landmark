import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * On every route change, briefly dim the screen — like a CRT switching scenes
 * before the next frame paints. Costs nothing if reduced motion is preferred.
 */
export default function PageFlicker() {
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    setActive(true);
    const id = window.setTimeout(() => setActive(false), 90);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  if (!active) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[55] bg-[var(--color-paper)]/40"
    />
  );
}
