import { type AnchorHTMLAttributes, forwardRef, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * With hash routing (GitHub Pages), an anchor like `#recorridos` is read as a route and leads to
 * "not found" (INC-11). In-page links scroll to the target and move focus to it instead, without
 * changing the route. The href keeps the target for reading, and middle-click opens the same page.
 */
export function scrollToTarget(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reduceMotion === 'true';
  target.scrollIntoView?.({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  // Focus without a second jump; sections get a temporary tabindex so focus can land on them.
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

interface InPageLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Id of the element to go to, without "#". */
  to: string;
}

export const InPageLink = forwardRef<HTMLAnchorElement, InPageLinkProps>(function InPageLink({ to, onClick, ...props }, ref) {
  return (
    <a
      ref={ref}
      href={`${window.location.pathname}${window.location.hash.split('#').slice(0, 2).join('#')}`}
      data-target={to}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        scrollToTarget(to);
      }}
      {...props}
    />
  );
});

/** "Saltar al contenido" (WCAG 2.4.1): moves focus to the main landmark without changing the route. */
export function SkipLink({ target = 'main-content' }: { target?: string }) {
  const { t } = useTranslation();
  return (
    <InPageLink
      to={target}
      className={cn(
        'sr-only rounded-sm bg-surface-container-lowest px-4 py-3 text-label-large text-primary',
        'focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:shadow-elevation-1',
      )}
    >
      {t('app.skipToContent')}
    </InPageLink>
  );
}
