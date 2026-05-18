import { useEffect, useState } from 'react';

import { submitFeedback, type FeedbackKind } from '../../lib/feedback';
import { useAuthStore } from '../../store/authStore';

interface FeedbackDialogProps {
  open: boolean;
  questionId: string;
  topicId: string;
  onClose: () => void;
}

const KINDS: { value: FeedbackKind; label: string; hint: string }[] = [
  { value: 'unclear', label: 'Unclear wording', hint: 'I had to re-read it twice.' },
  { value: 'wrong-answer', label: 'Wrong answer', hint: 'I think the marked correct answer is incorrect.' },
  { value: 'typo', label: 'Typo / formatting', hint: 'A small mistake in the prose or options.' },
  { value: 'other', label: 'Other', hint: 'Something else worth flagging.' },
];

type Status = 'idle' | 'submitting' | 'done' | 'error';

export default function FeedbackDialog({
  open,
  questionId,
  topicId,
  onClose,
}: FeedbackDialogProps) {
  const user = useAuthStore((s) => s.user);
  const [kind, setKind] = useState<FeedbackKind>('unclear');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setKind('unclear');
    setMessage('');
    setStatus('idle');
    setErrorMessage(null);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);
    const result = await submitFeedback({
      questionId,
      topicId,
      userId: user?.id,
      kind,
      message: message.trim() || undefined,
    });
    if (result.ok) {
      setStatus('done');
      // Auto-close after a beat so the user sees the confirmation.
      window.setTimeout(onClose, 1200);
    } else {
      setStatus('error');
      setErrorMessage(result.error);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Report a problem with this question"
      className="fixed inset-0 z-[60] flex items-start justify-center bg-[var(--color-ink)]/40 px-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[55ch] border border-[var(--color-rule)] bg-[var(--color-paper)] px-7 py-6 shadow-[2px_2px_0_0_var(--color-rule)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Report a problem
        </p>
        <h2 className="mt-1 text-xl font-bold text-[var(--color-ink)]">
          {status === 'done' ? 'Thanks for the report.' : 'What looks off?'}
        </h2>

        {status === 'done' ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Logged. We'll review it.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <fieldset>
              <legend className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Kind
              </legend>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {KINDS.map((k) => (
                  <label
                    key={k.value}
                    className={`flex cursor-pointer items-start gap-3 border px-3 py-2 transition-colors ${
                      kind === k.value
                        ? 'border-[var(--color-accent)] bg-[rgba(184,65,14,0.07)]'
                        : 'border-[var(--color-rule)] hover:border-[var(--color-ink)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedback-kind"
                      value={k.value}
                      checked={kind === k.value}
                      onChange={() => setKind(k.value)}
                      className="mt-1 accent-[var(--color-accent)]"
                    />
                    <span>
                      <span className="block text-sm text-[var(--color-ink)]">
                        {k.label}
                      </span>
                      <span className="block text-[0.65rem] italic text-[var(--color-muted)]">
                        {k.hint}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Details (optional)
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="What specifically would you change?"
                className="mt-2 w-full resize-y border border-[var(--color-rule)] bg-transparent px-3 py-2 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
              />
            </label>

            {errorMessage && (
              <p className="text-xs text-[var(--color-danger)]">
                {errorMessage}
              </p>
            )}

            <div className="flex items-baseline justify-end gap-5">
              <button
                type="button"
                onClick={onClose}
                className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] underline decoration-transparent underline-offset-4 hover:text-[var(--color-ink)] hover:decoration-[var(--color-rule)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="border border-[var(--color-accent)] bg-transparent px-5 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-accent)] transition-all duration-75 hover:bg-[var(--color-accent)] hover:text-[var(--color-paper)] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-30"
              >
                {status === 'submitting' ? 'Sending…' : '[ ENTER ] Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
