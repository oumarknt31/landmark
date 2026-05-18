import { apiUrl } from './api';

export interface LeaderboardEntry {
  handle: string;
  total_xp: number;
  last_active: string;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[] | null> {
  try {
    const res = await fetch(apiUrl('/api/leaderboard'));
    if (!res.ok) return null;
    const data = (await res.json()) as { users?: LeaderboardEntry[] };
    return data.users ?? [];
  } catch {
    return null;
  }
}
