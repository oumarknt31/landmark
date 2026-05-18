import { createClient } from '@supabase/supabase-js';

// Normalise the URL: the SDK builds endpoints by string concatenation, so
// any extra path (e.g. `/rest/v1/`) or trailing slash a user might paste from
// the Supabase dashboard produces malformed request URLs. Reduce to host only.
function normaliseSupabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const parsed = new URL(raw);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return raw.replace(/\/+$/, '');
  }
}

const url = normaliseSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * The Supabase client is null when env vars aren't set, for example, when a
 * contributor clones the repo and runs the app without provisioning their own
 * backend. The app still works fully against localStorage in that case; the
 * sync layer is the only thing that no-ops.
 */
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const isSupabaseConfigured = supabase !== null;
