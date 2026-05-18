import { useEffect, useState } from 'react';

import { useAuthStore } from '../../store/authStore';
import { useProgressStore } from '../../store/progressStore';

function formatRelative(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 5_000) return 'just now';
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

/**
 * Tiny status dot for background sync state. Lives in the nav alongside the
 * menu items but is visually distinct (a colored dot, not a button-looking
 * label) so it doesn't read as another page. Full state lives in the tooltip.
 */
export default function SyncIndicator() {
  const user = useAuthStore((s) => s.user);
  const status = useProgressStore((s) => s.syncStatus);
  const lastSyncedAt = useProgressStore((s) => s.lastSyncedAt);

  // Re-render every 15s so the relative time in the tooltip stays fresh.
  const [, force] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  if (!user) return null;

  let tooltip: string;
  let color: string;
  let pulse = false;
  if (status === 'syncing') {
    tooltip = 'Syncing…';
    color = 'var(--color-info)';
    pulse = true;
  } else if (status === 'error') {
    tooltip = lastSyncedAt
      ? `Sync failed (last synced ${formatRelative(lastSyncedAt)})`
      : 'Sync failed';
    color = 'var(--color-danger)';
  } else if (lastSyncedAt) {
    tooltip = `Synced ${formatRelative(lastSyncedAt)}`;
    color = 'var(--color-success)';
  } else {
    tooltip = 'Not synced yet';
    color = 'var(--color-muted)';
  }

  return (
    <span
      role="status"
      aria-label={tooltip}
      title={tooltip}
      className={`hidden h-2 w-2 shrink-0 self-center rounded-full sm:inline-block ${
        pulse ? 'animate-pulse' : ''
      }`}
      style={{ background: color }}
    />
  );
}
