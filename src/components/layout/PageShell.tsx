import type { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  /** Wider variant for browse pages; default tight 65ch for reading. */
  wide?: boolean;
}

export default function PageShell({ children, wide = false }: PageShellProps) {
  const max = wide ? 'max-w-[72ch]' : 'max-w-[65ch]';
  return (
    <div className={`mx-auto ${max} px-6 py-16 sm:py-20`}>{children}</div>
  );
}
