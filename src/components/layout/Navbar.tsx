import { Suspense, lazy, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import SyncIndicator from '../ui/SyncIndicator';
import { useSearchHotkey } from '../ui/useSearchHotkey';

// Vite inlines these env vars at build time, so checking them here doesn't
// pull in the Supabase client (which is lazy-loaded inside authStore).
const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const SearchPalette = lazy(() => import('../ui/SearchPalette'));
const SignInDialog = lazy(() => import('../auth/SignInDialog'));

const linkBase =
  'font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]';
const linkActive = 'text-[var(--color-ink)]';

export default function Navbar() {
  const { open, setOpen } = useSearchHotkey();
  const [signInOpen, setSignInOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const modKey =
    typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
      ? '⌘'
      : 'Ctrl';

  return (
    <>
      <header className="border-b border-[var(--color-rule)]">
        <div className="mx-auto flex max-w-[80ch] items-baseline justify-between px-6 py-3">
          <NavLink
            to="/"
            className="font-mono text-sm font-bold tracking-[0.18em] text-[var(--color-ink)]"
          >
            LANDMARK<span className="text-[var(--color-accent)]">_</span>
          </NavLink>
          <nav className="flex items-baseline gap-5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={`${linkBase} flex items-baseline gap-1.5`}
              aria-label="Open search"
            >
              <span>SEARCH</span>
              <kbd className="font-mono text-[0.6rem] text-[var(--color-muted)]">
                [{modKey}K]
              </kbd>
            </button>
            <NavLink
              to="/progress"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ''}`
              }
            >
              PROGRESS
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ''}`
              }
            >
              ABOUT
            </NavLink>
            {isSupabaseConfigured && <SyncIndicator />}
            {isSupabaseConfigured &&
              (user ? (
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className={linkBase}
                  title={user.email ?? undefined}
                >
                  LOGOUT
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSignInOpen(true)}
                  className={linkBase}
                >
                  LOGIN
                </button>
              ))}
          </nav>
        </div>
      </header>
      {open && (
        <Suspense fallback={null}>
          <SearchPalette open={open} onClose={() => setOpen(false)} />
        </Suspense>
      )}
      {signInOpen && (
        <Suspense fallback={null}>
          <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
