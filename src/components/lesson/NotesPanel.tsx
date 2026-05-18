import { useEffect, useState } from 'react';

import { useAuthStore } from '../../store/authStore';
import { useProgressStore } from '../../store/progressStore';

interface NotesPanelProps {
  topicId: string;
}

const supabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);

/**
 * A textarea bound to `progressStore.notes[topicId]`. Local-first: writes
 * land in Zustand (and localStorage via persist) immediately. The sync layer
 * then debounce-pushes the whole progress blob to Supabase when signed in.
 *
 * We don't render Markdown, these are quick study notes, not documents.
 */
export default function NotesPanel({ topicId }: NotesPanelProps) {
  const note = useProgressStore((s) => s.notes[topicId] ?? '');
  const setNote = useProgressStore((s) => s.setNote);
  const user = useAuthStore((s) => s.user);

  // Local draft state so each keystroke doesn't churn the global store.
  // We flush to the store on a 400ms idle window.
  const [draft, setDraft] = useState(note);

  useEffect(() => {
    setDraft(note);
  }, [topicId, note]);

  useEffect(() => {
    if (draft === note) return;
    const id = setTimeout(() => setNote(topicId, draft), 400);
    return () => clearTimeout(id);
  }, [draft, note, setNote, topicId]);

  const syncHint =
    supabaseConfigured && user
      ? 'Synced to your account.'
      : supabaseConfigured
        ? 'Local only, sign in to sync across devices.'
        : 'Local only.';

  return (
    <section className="mt-12">
      <p className="font-sans text-sm uppercase tracking-[0.12em] text-[var(--color-muted)]">
        Notes
      </p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Jot anything you want to remember about this topic…"
        rows={6}
        className="mt-3 w-full resize-y border border-[var(--color-rule)] bg-transparent px-4 py-3 font-serif text-base leading-relaxed text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
      />
      <p className="mt-2 font-sans text-xs italic text-[var(--color-muted)]">
        {syncHint}
      </p>
    </section>
  );
}
