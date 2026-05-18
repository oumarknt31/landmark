import { useEffect, useRef, useState } from 'react';

import { useAuthStore } from '../../store/authStore';

interface SignInDialogProps {
  open: boolean;
  onClose: () => void;
}

type Mode = 'signin' | 'signup' | 'guest';

export default function SignInDialog({ open, onClose }: SignInDialogProps) {
  const signUp = useAuthStore((s) => s.signUp);
  const signIn = useAuthStore((s) => s.signIn);
  const signInAnonymously = useAuthStore((s) => s.signInAnonymously);

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setMode('signin');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setSubmitting(false);
    setErrorMsg(null);
    const id = requestAnimationFrame(() => firstInputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleGuest() {
    setSubmitting(true);
    setErrorMsg(null);
    const { error } = await signInAnonymously();
    setSubmitting(false);
    if (error) setErrorMsg(error);
    else onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    const result =
      mode === 'signup'
        ? await signUp({ email, password, displayName })
        : await signIn({ email, password });
    setSubmitting(false);
    if (result.error) setErrorMsg(result.error);
    else onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Account"
      className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--color-ink)]/40 px-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[52ch] border border-[var(--color-rule)] bg-[var(--color-paper)] px-7 py-7 shadow-[2px_2px_0_0_var(--color-rule)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Account
        </p>
        <h2 className="mt-1 text-xl font-bold text-[var(--color-ink)]">
          {mode === 'signin'
            ? 'Sign in'
            : mode === 'signup'
              ? 'Create an account'
              : 'Continue as guest'}
        </h2>

        {/* Tab strip */}
        <nav className="mt-5 flex gap-4 border-b border-[var(--color-rule)] pb-1">
          {(['signin', 'signup', 'guest'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setErrorMsg(null);
              }}
              className={`-mb-px border-b-2 pb-2 text-xs uppercase tracking-[0.18em] transition-colors ${
                mode === m
                  ? 'border-[var(--color-accent)] text-[var(--color-ink)]'
                  : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              {m === 'signin' ? 'Sign in' : m === 'signup' ? 'Sign up' : 'Guest'}
            </button>
          ))}
        </nav>

        {mode === 'guest' && (
          <>
            <p className="mt-5 text-sm leading-relaxed text-[var(--color-muted)]">
              Get started instantly with no email and no password. Your progress
              is saved on this device and synced to an anonymous account. You
              can attach an email later if you want cross-device access.
            </p>
            {errorMsg && (
              <p className="mt-3 text-xs text-[var(--color-danger)]">
                {errorMsg}
              </p>
            )}
            <div className="mt-7 flex items-baseline justify-end gap-5">
              <button
                type="button"
                onClick={onClose}
                className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] underline decoration-transparent underline-offset-4 hover:text-[var(--color-ink)] hover:decoration-[var(--color-rule)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGuest}
                disabled={submitting}
                className="border border-[var(--color-accent)] bg-transparent px-5 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-accent)] transition-all duration-75 hover:bg-[var(--color-accent)] hover:text-[var(--color-paper)] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-30"
              >
                {submitting ? 'Working…' : 'Continue as guest →'}
              </button>
            </div>
          </>
        )}

        {(mode === 'signin' || mode === 'signup') && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Email
              </span>
              <input
                ref={firstInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete={mode === 'signup' ? 'email' : 'username'}
                className="mt-1 w-full border border-[var(--color-rule)] bg-transparent px-3 py-2 text-base text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === 'signup' ? 8 : undefined}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="mt-1 w-full border border-[var(--color-rule)] bg-transparent px-3 py-2 text-base text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
              />
              {mode === 'signup' && (
                <span className="mt-1 block text-[0.65rem] text-[var(--color-muted)]">
                  At least 8 characters.
                </span>
              )}
            </label>

            {mode === 'signup' && (
              <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Display name (public)
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[A-Za-z0-9_]+"
                  placeholder="ada_lovelace"
                  className="mt-1 w-full border border-[var(--color-rule)] bg-transparent px-3 py-2 text-base text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                />
                <span className="mt-1 block text-[0.65rem] text-[var(--color-muted)]">
                  Letters, numbers, and underscores. Shown on the leaderboard.
                  Your email stays private.
                </span>
              </label>
            )}

            {errorMsg && (
              <p className="text-xs text-[var(--color-danger)]">{errorMsg}</p>
            )}

            <div className="flex items-baseline justify-end gap-5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] underline decoration-transparent underline-offset-4 hover:text-[var(--color-ink)] hover:decoration-[var(--color-rule)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="border border-[var(--color-accent)] bg-transparent px-5 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-accent)] transition-all duration-75 hover:bg-[var(--color-accent)] hover:text-[var(--color-paper)] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-30"
              >
                {submitting
                  ? 'Working…'
                  : mode === 'signup'
                    ? 'Create account →'
                    : 'Sign in →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
