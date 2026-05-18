export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--color-rule)]">
      <div className="mx-auto max-w-[72ch] px-6 py-8 font-sans text-xs text-[var(--color-muted)]">
        <p>
          Originally built in C++ with Qt as an honors project at BMCC in 2023.
          Rebuilt for the web in 2026 by{' '}
          <a
            href="https://github.com/oumarknt31"
            className="text-[var(--color-ink)] underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-accent)]"
            target="_blank"
            rel="noreferrer"
          >
            Oumar Kante
          </a>
          .
        </p>
        <p className="mt-2">
          Source on{' '}
          <a
            href="https://github.com/oumarknt31/Landmark-Learning-App-Optimized-"
            className="text-[var(--color-ink)] underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-accent)]"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
