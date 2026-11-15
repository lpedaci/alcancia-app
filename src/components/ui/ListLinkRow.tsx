import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';

/**
 * One row of an M3 list with a single action (D-279, D-294, D-301): the whole row is the link, on a
 * tonal surface, with the icon, a title, an optional line of detail and a trailing chevron. Hover and
 * focus are on the row, never an underline on a word. Used for reviews, shortcuts and similar lists.
 */
export function ListLinkRow({
  to,
  icon,
  title,
  detail,
  srPrefix,
  className,
}: {
  to: string;
  icon: IconName;
  title: string;
  detail?: string;
  /** Read before the title, for the action ("Repasar: "); the title stays the visible name (WCAG 2.5.3). */
  srPrefix?: string;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-14 items-center gap-3 rounded-lg bg-surface-container px-3 py-2 transition-colors duration-150 hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        className,
      )}
    >
      <Icon name={icon} size={20} className="shrink-0 text-primary" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-label-large text-on-surface">
          {srPrefix && <span className="sr-only">{srPrefix}: </span>}
          {title}
        </span>
        {detail && <span className="text-body-small text-on-surface-variant">{detail}</span>}
      </span>
      <Icon name="chevron_right" size={20} className="shrink-0 text-on-surface-variant" />
    </Link>
  );
}
