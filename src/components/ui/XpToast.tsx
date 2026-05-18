import { useEffect, useState } from 'react';

import { useProgressStore } from '../../store/progressStore';

/**
 * A single transient toast that announces a recent XP gain. Slides in from
 * the bottom-right, holds for ~2.5s, then fades out. The store's recentXpGain
 * field is cleared when the fade completes so the next event can fire fresh.
 */
export default function XpToast() {
  const recent = useProgressStore((s) => s.recentXpGain);
  const clearRecentXp = useProgressStore((s) => s.clearRecentXp);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!recent) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const fadeAt = window.setTimeout(() => setVisible(false), 2500);
    const clearAt = window.setTimeout(() => clearRecentXp(), 2800);
    return () => {
      window.clearTimeout(fadeAt);
      window.clearTimeout(clearAt);
    };
  }, [recent, clearRecentXp]);

  if (!recent) return null;

  const label = recent.source === 'lesson' ? 'Lesson opened' : 'Quiz completed';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-6 right-6 z-[70] transition-all duration-300 ${
        visible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-3 opacity-0'
      }`}
    >
      <div className="border border-[var(--color-accent)] bg-[var(--color-paper)] px-4 py-3 shadow-[2px_2px_0_0_var(--color-rule)]">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-2xl font-bold tabular-nums text-[var(--color-accent)]">
            +{recent.amount}
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            XP
          </span>
        </div>
        <p className="mt-1 text-xs text-[var(--color-ink)]">{label}</p>
      </div>
    </div>
  );
}
