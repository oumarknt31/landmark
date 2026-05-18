import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

/**
 * Initialise Sentry once at startup. We only enable it in production so dev
 * stack traces stay local and we don't burn quota on hot-reload errors.
 */
export function initSentry() {
  if (!dsn || import.meta.env.DEV) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Tag the release with Vite's build-time commit hash if Vercel injects one.
    release: import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA,
    // We only care about uncaught errors for now, skip tracing, session
    // replay, and other heavy default integrations to keep the bundle lean.
    integrations: [],
    tracesSampleRate: 0,
  });
}

/** Re-export the ErrorBoundary so callers don't import Sentry directly. */
export const SentryErrorBoundary = Sentry.ErrorBoundary;
