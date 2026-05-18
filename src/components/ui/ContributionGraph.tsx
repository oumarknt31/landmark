import { useEffect, useRef } from 'react';

import { dateKey } from '../../lib/streak';

interface ContributionGraphProps {
  daily: Record<string, number>;
  /** Number of days to show, ending today. Default: 364 (52 weeks). */
  days?: number;
}

interface Cell {
  date: Date;
  xp: number;
}

const CELL = 11;
const GAP = 2;
const STEP = CELL + GAP;
const LABEL_W = 28;
const LABEL_H = 14;

function intensity(xp: number): string {
  if (xp === 0) return 'rgba(58, 40, 24, 0.08)';
  if (xp < 15) return 'rgba(184, 65, 14, 0.28)';
  if (xp < 40) return 'rgba(184, 65, 14, 0.55)';
  if (xp < 80) return 'rgba(184, 65, 14, 0.78)';
  return 'var(--color-accent)';
}

export default function ContributionGraph({
  daily,
  days = 364,
}: ContributionGraphProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = dateKey(today);
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));

  // Pad leading days so the first column starts on Sunday.
  const cells: (Cell | null)[] = [];
  const leadingBlank = start.getDay(); // 0=Sun
  for (let i = 0; i < leadingBlank; i++) cells.push(null);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    cells.push({ date: d, xp: daily[dateKey(d)] ?? 0 });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = cells.length / 7;
  const width = LABEL_W + weeks * STEP;
  const height = LABEL_H + 7 * STEP;

  // Month labels: emit a label at the first week-column where that month begins.
  const monthLabels: { week: number; label: string }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const cell = cells[w * 7];
    if (cell) {
      const m = cell.date.getMonth();
      if (m !== lastMonth) {
        monthLabels.push({
          week: w,
          label: cell.date.toLocaleDateString('en-US', { month: 'short' }),
        });
        lastMonth = m;
      }
    }
  }

  // Auto-scroll to the right edge on mount so today's cell is immediately
  // visible inside the horizontal-scroll container.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  return (
    <div ref={scrollerRef} className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="One year of daily XP activity"
        className="block"
      >
        {/* Month labels along the top */}
        {monthLabels.map((m) => (
          <text
            key={`${m.week}-${m.label}`}
            x={LABEL_W + m.week * STEP}
            y={10}
            fontSize="9"
            fill="var(--color-muted)"
            fontFamily="var(--font-mono)"
          >
            {m.label}
          </text>
        ))}

        {/* Day-of-week labels down the left */}
        {['Mon', 'Wed', 'Fri'].map((label, idx) => (
          <text
            key={label}
            x={0}
            y={LABEL_H + (idx * 2 + 1) * STEP + CELL - 2}
            fontSize="9"
            fill="var(--color-muted)"
            fontFamily="var(--font-mono)"
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        {cells.map((c, i) => {
          const week = Math.floor(i / 7);
          const dow = i % 7;
          if (!c) return null;
          const isToday = dateKey(c.date) === todayStr;
          return (
            <rect
              key={c.date.toISOString()}
              x={LABEL_W + week * STEP}
              y={LABEL_H + dow * STEP}
              width={CELL}
              height={CELL}
              fill={intensity(c.xp)}
              stroke={isToday ? 'var(--color-ink)' : 'var(--color-rule)'}
              strokeWidth={isToday ? 1.5 : 0.5}
            >
              <title>
                {c.date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                {isToday ? ' (today)' : ''} — {c.xp} XP
              </title>
            </rect>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        <span>less</span>
        {[0, 10, 25, 60, 100].map((xp) => (
          <span
            key={xp}
            className="inline-block"
            style={{
              width: 12,
              height: 12,
              backgroundColor: intensity(xp),
              border: '0.5px solid var(--color-rule)',
            }}
          />
        ))}
        <span>more</span>
        <span className="ml-4 inline-flex items-center gap-2">
          <span
            style={{
              width: 12,
              height: 12,
              border: '1.5px solid var(--color-ink)',
              backgroundColor: 'transparent',
            }}
          />
          today
        </span>
      </div>
    </div>
  );
}
