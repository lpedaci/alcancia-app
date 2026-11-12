import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

/**
 * Alcancía wordmark: a savings mark in an indigo square and the name. Own identity, not Rumbo's
 * (CLAUDE.md, header). Decorative mark; the name is real text.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-title-medium text-on-surface', className)}>
      <span aria-hidden className="inline-flex size-8 items-center justify-center rounded-sm bg-primary text-on-primary">
        <Icon name="savings" size={20} filled />
      </span>
      <span className={cn(compact && 'sr-only')}>Alcancía</span>
    </span>
  );
}
