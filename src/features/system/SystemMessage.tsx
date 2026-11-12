import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Logo } from '@/components/layout/Logo';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

export interface Suggestion {
  to: string;
  icon: IconName;
  label: string;
}

/**
 * Shared layout of the G7 pages (not found, access not allowed, unexpected error): it says what
 * happened without blame (2.9) and reorients the person: one main action, going back, and a short
 * list of places that always work. Flat surfaces; the code is information, not decoration.
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
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface px-(--space-gutter) py-6">
      <header className="mx-auto w-full max-w-3xl">
        <Link to="/" className="inline-flex rounded-sm">
          <Logo />
        </Link>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-10 focus:outline-none">
        <section className="grid gap-8 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:p-10">
          <div className="flex min-w-0 flex-col items-start gap-4">
            <span
              className={cn(
                'flex size-12 items-center justify-center rounded-lg',
                tone === 'error' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container',
              )}
            >
              <Icon name={icon} size={24} />
            </span>
            <p className="text-label-large text-primary">{code}</p>
            <h1 className="text-headline-small text-balance text-on-surface">{title}</h1>
            <p className="text-body-large text-on-surface-variant">{body}</p>
            <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row">{actions}</div>
            {children}
          </div>
          {suggestions.length > 0 && (
            <nav aria-labelledby="system-suggestions" className="flex min-w-0 flex-col gap-3 border-t border-outline-variant pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <h2 id="system-suggestions" className="text-title-small text-on-surface">
                {suggestionsTitle}
              </h2>
              <ul className="flex flex-col gap-1">
                {suggestions.map((s) => (
                  <li key={s.to}>
                    <Link
                      to={s.to}
                      className="-mx-3 flex min-h-12 items-center gap-3 rounded-md px-3 text-body-medium text-on-surface hover:bg-surface-container md:min-h-10"
                    >
                      <Icon name={s.icon} size={20} className="shrink-0 text-on-surface-variant" />
                      <span className="min-w-0 flex-1">{s.label}</span>
                      <Icon name="chevron_right" size={20} className="shrink-0 text-on-surface-variant" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </section>
      </main>
    </div>
  );
}
