import { Link } from 'react-router-dom';

interface ErrorScreenProps {
  resetError?: () => void;
}

export default function ErrorScreen({ resetError }: ErrorScreenProps) {
  return (
    <main className="mx-auto max-w-[65ch] px-6 py-24">
      <p className="font-sans text-sm uppercase tracking-[0.12em] text-[var(--color-muted)]">
        Something broke
      </p>
      <h1 className="mt-2 font-serif text-5xl font-medium tracking-tight text-[var(--color-ink)]">
        That wasn't supposed to happen.
      </h1>
      <p className="mt-6 max-w-[55ch] font-serif text-lg text-[var(--color-muted)]">
        The error has been reported. Try reloading the page, most things
        come back fine.
      </p>
      <div className="mt-10 flex gap-8">
        {resetError && (
          <button
            type="button"
            onClick={resetError}
            className="font-sans text-sm text-[var(--color-ink)] underline decoration-[var(--color-rule)] underline-offset-4 hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)]"
          >
            Try again
          </button>
        )}
        <Link
          to="/"
          onClick={resetError}
          className="font-sans text-sm text-[var(--color-ink)] underline decoration-[var(--color-rule)] underline-offset-4 hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
