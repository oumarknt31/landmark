import { useEffect, useState } from 'react';

/**
 * Cmd+K (Mac) / Ctrl+K opens the search palette. Returns the open state and
 * setter so consumers can wire their own buttons too.
 */
export function useSearchHotkey() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return { open, setOpen };
}
