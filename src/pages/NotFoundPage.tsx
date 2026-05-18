import { Link } from 'react-router-dom';

import PageShell from '../components/layout/PageShell';

export default function NotFoundPage() {
  return (
    <PageShell>
      <p className="font-sans text-sm uppercase tracking-[0.12em] text-[var(--color-muted)]">
        Not found
      </p>
      <h1 className="mt-2 font-serif text-5xl font-medium tracking-tight text-[var(--color-ink)]">
        404
      </h1>
      <p className="mt-6 font-sans text-base text-[var(--color-muted)]">
        This page doesn't exist, or it moved without telling anyone.
      </p>
      <p className="mt-8">
        <Link
          to="/"
          className="font-sans text-sm text-[var(--color-ink)] underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-accent)]"
        >
          Back to home
        </Link>
      </p>
    </PageShell>
  );
}
