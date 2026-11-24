import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Logo } from '@/components/layout/Logo';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Fuerte, type FuerteState } from '@/features/companion/Fuerte';
import { cn } from '@/lib/utils';

export interface Suggestion {
  to: string;
  icon: IconName;
  label: string;
}

/**
 * Shared layout of the G7 pages (not found, access not allowed, unexpected error), D-229: it says
 * what happened without blame (2.9) and reorients the person. The floating top bar of the app spans
 * the width; the content keeps a reading width, centered. In the card, the message on the left (code, title, explanation, one main action) and
 * Fuerte on the right with the expression of the moment, without a speech bubble (the text is the
 * message). Below, places that always work, as tiles (grid-fill-3, D-217).
 */
export function SystemMessage({
  icon,
  tone = 'neutral',
  code,
  title,
  body,
  actions,
  suggestionsTitle,
  suggestions = [],
  fuerte,
  children,
}: {
  icon: IconName;
  tone?: 'neutral' | 'error';
  code: string;
  title: string;
  body: string;
  /** Main action first, then "Volver a la página anterior". */
  actions: ReactNode;
  suggestionsTitle?: string;
  suggestions?: Suggestion[];
  /** Fuerte's expression for the moment (D-225); decorative, the text carries the message. */
  fuerte?: FuerteState;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col gap-3 bg-surface p-(--space-gutter) medium:p-3">
      {/* The same floating top bar as the app (2.2.1, pattern 5) */}
      <header className="flex min-h-16 items-center rounded-xl border border-outline-variant bg-surface-container-lowest px-4">
        <Link to="/" className="inline-flex rounded-sm">
          <Logo />
        </Link>
      </header>
      {/* Only the top bar spans the width; the message keeps a comfortable reading width, centered */}
      <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-3 py-6 focus:outline-none md:py-10">
        <section className="@container flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:p-10">
          <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 @2xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex min-w-0 flex-col items-start gap-4">
              <p className={cn('inline-flex items-center gap-2 text-label-large', tone === 'error' ? 'text-error' : 'text-primary')}>
                <Icon name={icon} size={20} />
                {code}
              </p>
              <h1 className="text-headline-medium text-balance text-on-surface">{title}</h1>
              <p className="text-body-large text-on-surface-variant">{body}</p>
              {/* Secondary first and on the left, primary last and on the right; on phones the primary goes on top (D-331) */}
              <div className="flex w-full flex-col-reverse gap-3 pt-2 sm:w-auto sm:flex-row">{actions}</div>
              {children}
            </div>
            {fuerte && (
              // Fuerte on the right, large, with the expression of the moment (decorative)
              <div className="order-first flex justify-center @2xl:order-none">
                <Fuerte state={fuerte} lights={1} size={8} className="@2xl:w-44" />
              </div>
            )}
          </div>
        </section>
        {suggestions.length > 0 && (
          <nav aria-labelledby="system-suggestions" className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 id="system-suggestions" className="text-title-medium text-on-surface">
              {suggestionsTitle}
            </h2>
            <ul className="grid grid-fill-3 gap-3">
              {suggestions.map((s) => (
                <li key={s.to}>
                  <Link
                    to={s.to}
                    className="flex min-h-14 items-center gap-3 rounded-lg border border-outline-variant px-4 text-body-medium text-on-surface transition-colors duration-150 hover:bg-surface-container"
                  >
                    <Icon name={s.icon} size={20} className="shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">{s.label}</span>
                    <Icon name="chevron_right" size={20} className="shrink-0 text-on-surface-variant" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>
    </div>
  );
}
