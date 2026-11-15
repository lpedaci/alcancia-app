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
  /** A wider card, for content laid out in columns (the demo accounts of G2). */
  wide?: boolean;
}

/**
 * Layout of the access screens (G1 to G5): a clean, centered column like a real company sign-in,
 * with an optional right column. Flat surfaces, no gradients (2.2).
 */
export function AuthLayout({ children, aside, showcase, wide }: AuthLayoutProps) {
  if (!showcase) return <PlainLayout aside={aside} wide={wide}>{children}</PlainLayout>;

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-surface-container-lowest lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:p-3">
      <SkipLink />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-w-0 flex-col items-center px-(--space-gutter) py-8 focus:outline-none md:justify-center lg:py-10 [@media(max-height:50rem)]:py-6"
      >
        <div className="flex w-full max-w-md min-w-0 flex-col gap-8 [@media(max-height:50rem)]:gap-6">
          {/* The logo goes back to the landing (G0). */}
          <Link to="/" className="flex min-h-12 w-fit items-center rounded-sm md:min-h-0">
            <Logo />
          </Link>
          {children}
        </div>
      </main>
      <aside className="hidden min-w-0 overflow-hidden rounded-xl bg-primary-container px-10 pt-12 lg:flex lg:flex-col xl:px-14">
        {showcase}
      </aside>
    </div>
  );
}

/**
 * G2 to G5 (D-229): the floating top bar of the app spans the width with the logo, and the content
 * keeps a comfortable width, centered in a card; G4 adds its help column beside it from 1024 px.
 */
function PlainLayout({ children, aside, wide }: { children: ReactNode; aside?: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col gap-3 bg-surface p-(--space-gutter) medium:p-3">
      <SkipLink />
      <header className="flex min-h-16 items-center rounded-xl border border-outline-variant bg-surface-container-lowest px-4">
        {/* The logo goes back to the landing (G0). */}
        <Link to="/" className="flex min-h-12 w-fit items-center rounded-sm md:min-h-0">
          <Logo />
        </Link>
      </header>
      <div className={cn('mx-auto grid w-full flex-1 grid-cols-1 items-center gap-3 md:py-2 [@media(max-height:50rem)]:md:py-0', aside ? 'max-w-6xl lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-stretch' : wide ? 'max-w-4xl' : 'max-w-3xl')}>
        <main
          id="main-content"
          tabIndex={-1}
          className="flex min-w-0 flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 focus:outline-none sm:p-6 md:p-8 [@media(max-height:50rem)]:gap-4 [@media(max-height:50rem)]:md:p-6"
        >
          {children}
        </main>
        {aside && (
          <aside className="hidden min-w-0 flex-col rounded-xl border border-outline-variant bg-surface-container p-8 lg:flex">
            {/* Aligned to the top, next to the form it complements */}
            <div className="w-full max-w-md">{aside}</div>
          </aside>
        )}
      </div>
    </div>
  );
}
