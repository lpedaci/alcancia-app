import { SkipLink } from '@/components/layout/InPageLink';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageShellProps {
  children: ReactNode;
  /** Narrow centered column (default) or full-width content. */
  width?: 'narrow' | 'wide';
}

/** Minimal shell until the G6 layout (step 5): skip link and a single `main` landmark. */
export function PageShell({ children, width = 'narrow' }: PageShellProps) {

  return (
    <>
      <SkipLink />
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          'mx-auto flex w-full flex-col px-(--space-gutter) focus:outline-none',
          width === 'narrow' ? 'min-h-dvh max-w-2xl justify-center gap-6 py-12' : 'max-w-[max(80rem,80%)] gap-(--space-section) py-8',
        )}
      >
        {children}
      </main>
    </>
  );
}
