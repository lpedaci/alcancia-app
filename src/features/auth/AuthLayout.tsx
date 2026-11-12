import { SkipLink } from '@/components/layout/InPageLink';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Logo } from '@/components/layout/Logo';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
  /** Right column from 1024 px (help channels in G4). */
  aside?: ReactNode;
  /** Product showcase on the right from 1024 px (G1): flat tinted panel, never a gradient. */
  showcase?: ReactNode;
}

/**
 * Layout of the access screens (G1 to G5): a clean, centered column like a real company sign-in,
 * with an optional right column. Flat surfaces, no gradients (2.2).
 */
export function AuthLayout({ children, aside, showcase }: AuthLayoutProps) {

  return (
    <div
      className={cn(
        'grid min-h-dvh grid-cols-1 bg-surface-container-lowest',
        aside && 'lg:grid-cols-2',
        showcase && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:p-3',
      )}
    >
      <SkipLink />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-w-0 flex-col items-center px-(--space-gutter) py-8 focus:outline-none md:justify-center lg:py-10 [@media(max-height:50rem)]:py-6"
      >
        <div className={cn('flex w-full min-w-0 flex-col gap-8 [@media(max-height:50rem)]:gap-6', showcase || aside ? 'max-w-md' : 'max-w-xl')}>
          {/* The logo goes back to the landing (G0). */}
          <Link to="/" className="flex min-h-12 w-fit items-center rounded-sm md:min-h-0">
            <Logo />
          </Link>
          {children}
        </div>
      </main>
      {showcase && (
        <aside className="hidden min-w-0 overflow-hidden rounded-xl bg-primary-container px-10 py-12 lg:flex lg:flex-col lg:justify-center xl:px-16">
          {showcase}
        </aside>
      )}
      {aside && (
        <aside className="hidden min-w-0 border-l border-outline-variant bg-surface-container px-10 py-12 lg:flex lg:items-center lg:justify-center">
          <div className="w-full max-w-md">{aside}</div>
        </aside>
      )}
    </div>
  );
}
