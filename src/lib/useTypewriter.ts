import { useEffect, useState } from 'react';

/**
 * Reveals `text` one character at a time, like an old terminal printing to
 * the screen. Returns the currently-revealed substring plus a `done` flag so
 * the caller can swap in a blinking caret once typing finishes.
 */
export function useTypewriter(text: string, speed = 28) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown('');
    setDone(false);
    if (!text) {
      setDone(true);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return { shown, done };
}
