import PageShell from '../components/layout/PageShell';

export default function AboutPage() {
  return (
    <PageShell>
      <p className="font-sans text-sm uppercase tracking-[0.12em] text-[var(--color-muted)]">
        About
      </p>
      <h1 className="mt-2 font-serif text-5xl font-medium tracking-tight text-[var(--color-ink)]">
        About Landmark
      </h1>

      <hr className="my-12 border-[var(--color-rule)]" />

      <div className="space-y-6 font-serif text-lg leading-relaxed text-[var(--color-ink)]">
        <p>
          Landmark is a study companion for foundational computer
          science. Twelve topics, three chapters &mdash; foundations,
          building the system, optimisation &amp; systems &mdash; each
          paired with a short lesson and a five-question drill.
        </p>
        <p>
          The first version was a different shape. It started as an
          honors project at BMCC in the fall of 2023: a C++ desktop app
          built with Qt to drill C++ fundamentals before a midterm. It
          worked, but it stayed on my laptop. Rebuilding it on the web
          in 2026 turned it into something I could share, and gave me a
          reason to learn the modern full stack in earnest.
        </p>
        <p>
          The architecture grew with the project. The frontend is a
          React app with a local-first progress store that syncs to
          Postgres via Supabase the moment you sign in. A Node gateway
          (Hono) handles auth-aware proxying, AI explanations, the
          leaderboard, and rate limiting. A separate Python service
          (FastAPI) holds the ML and data work: semantic search over
          lessons using sentence-transformers, per-user analytics in
          pandas, and admin-only question generation with Claude.
        </p>
        <p>
          Search is hybrid. A browser-side full-text index (MiniSearch,
          TF-IDF) answers keyword queries instantly; the Python service
          embeds your query into a vector space and returns matches by
          meaning. The two rankings are fused with Reciprocal Rank
          Fusion, so a single search box handles both
          <em> &ldquo;recursion&rdquo;</em> and{' '}
          <em>&ldquo;how does a CPU run instructions&rdquo;</em>{' '}
          without a mode toggle.
        </p>
        <p>
          A few things help it punch above its weight: spaced-repetition
          drilling tuned by SM-2, an offline-capable PWA build, daily
          XP with a GitHub-style activity heatmap, a leaderboard with
          anonymized handles, end-to-end Playwright tests gated in CI,
          and a per-question <em>Why is this the answer?</em> button
          that calls Claude with aggressive prompt caching.
        </p>
        <p>
          Content is curated and adapted from open-licensed sources
          &mdash; primarily Wikipedia articles on computer science, with
          questions rewritten in interview-style framing rather than
          copied. Each topic credits its sources at the bottom of the
          lesson.
        </p>
        <p>
          The security posture, transport headers, CORS allowlists,
          Postgres row-level security, rate limiting, and admin-token
          bridging between Node and Python, is documented in{' '}
          <code className="font-mono text-base">SECURITY.md</code> in
          the repository.
        </p>
      </div>

      <hr className="my-12 border-[var(--color-rule)]" />

      <p className="font-sans text-sm text-[var(--color-muted)]">
        Oumar Kante &middot; 2026
      </p>
    </PageShell>
  );
}
