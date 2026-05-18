/**
 * Deterministic anime-flavored handle for anonymous users.
 *
 * Seeded from the Supabase user UUID, so a given guest always gets the same
 * name (even if local state is wiped and rebuilt from the SQL fallback).
 * We avoid character names — only generic anime tropes (yokai, roles,
 * objects) and color/mood adjectives.
 */

const ADJECTIVES = [
  'Crimson',
  'Midnight',
  'Silent',
  'Wandering',
  'Brave',
  'Lone',
  'Golden',
  'Silver',
  'Lucky',
  'Swift',
  'Quiet',
  'Sunlit',
  'Moonlit',
  'Hidden',
  'Restless',
  'Patient',
  'Cheerful',
  'Bold',
  'Steady',
  'Drifting',
  'Gentle',
  'Stoic',
  'Fierce',
  'Curious',
  'Ember',
  'Frost',
  'Shadow',
  'Iron',
  'Jade',
  'Ivory',
] as const;

const NOUNS = [
  'Samurai',
  'Ronin',
  'Ninja',
  'Kitsune',
  'Tanuki',
  'Oni',
  'Shinigami',
  'Sensei',
  'Senpai',
  'Kohai',
  'Otaku',
  'Sakura',
  'Onigiri',
  'Katana',
  'Shuriken',
  'Bushido',
  'Yokai',
  'Tengu',
  'Hatamoto',
  'Bonsai',
  'Mecha',
  'Pilot',
  'Wanderer',
  'Scholar',
  'Archer',
  'Monk',
  'Inari',
  'Hoshi',
  'Tora',
  'Hayabusa',
] as const;

/** Deterministic 32-bit hash of a string (FNV-1a). */
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function generateAnimeName(seed: string): string {
  if (!seed) return 'WanderingRonin';
  const adj = ADJECTIVES[fnv1a(seed + ':a') % ADJECTIVES.length];
  const noun = NOUNS[fnv1a(seed + ':n') % NOUNS.length];
  const num = fnv1a(seed + ':#') % 100;
  return `${adj}${noun}${num.toString().padStart(2, '0')}`;
}
