import { useEffect, useRef } from 'react';

/**
 * A trail of small fading dots that follows the cursor. Spawns DOM nodes
 * (throttled to ~25 per second) and removes them once their fade animation
 * finishes. Subtle by design — the dot is 3px and fades in ~500ms.
 *
 * Disabled if the user prefers reduced motion.
 */
export default function MouseTrail() {
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) return;

    function onMove(e: MouseEvent) {
      const now = performance.now();
      // Throttle: at most one dot every ~40ms so we don't make 1000 nodes/sec.
      if (now - lastSpawnRef.current < 40) return;
      lastSpawnRef.current = now;

      const dot = document.createElement('div');
      dot.className = 'pointer-events-none fixed z-[60]';
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      dot.style.width = '4px';
      dot.style.height = '4px';
      dot.style.background = 'var(--color-accent)';
      dot.style.transform = 'translate(-50%, -50%)';
      dot.style.opacity = '0.6';
      dot.style.boxShadow = '0 0 4px rgba(184, 65, 14, 0.4)';

      const anim = dot.animate(
        [
          { opacity: 0.55, transform: 'translate(-50%, -50%) scale(1)' },
          { opacity: 0, transform: 'translate(-50%, -50%) scale(0.2)' },
        ],
        { duration: 520, easing: 'ease-out', fill: 'forwards' },
      );
      anim.onfinish = () => dot.remove();

      document.body.appendChild(dot);
    }

    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  return null;
}
