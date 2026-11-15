import { Icon, type IconName } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

export interface MetaItem {
  icon: IconName;
  label: string;
  /** ISO date, when the item is a date: rendered as <time> (dates DD/MM/AAAA, 2.9). */
  dateTime?: string;
  /** Emphasis for the item that matters most (for example, the current level). */
  strong?: boolean;
  /** Extra classes for one chip, for example to hide it on small screens. */
  className?: string;
}

/** In `compact` mode, how many items the one line shows on phones and tablets (D-299). */
const COMPACT_ITEMS = 2;

/**
 * Context data of a page (date, program, organization, level): one row of white chips with an icon,
 * the same in the wallet and in the panels of every role (D-162). Color goes only to the icon, so
 * the chips read well on any surface without mixing tints.
 *
 * `compact` (D-299), for the header of a page, under its title: on phones and tablets (below 840 px)
 * the first two chips in one row, never two lines; if they do not fit, the second one shortens with an
 * ellipsis (its full text in a tooltip). From 840 px, all the chips.
 */
export function MetaChips({ items, label, className, compact }: { items: MetaItem[]; label?: string; className?: string; compact?: boolean }) {
  return (
    <ul
      aria-label={label}
      className={cn(compact ? 'flex min-w-0 flex-nowrap gap-2 expanded:flex-wrap' : 'flex flex-wrap gap-2', className)}
    >
      {items.map((item, index) => (
        <li
          key={item.label}
          title={compact && index > 0 ? item.label : undefined}
          className={cn(
            'inline-flex min-h-7 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-label-medium',
            // Compact: one row; the first chip keeps its size, the second shrinks with an ellipsis,
            // the rest show from 840 px
            compact && (index === 0 ? 'shrink-0' : 'min-w-0'),
            compact && index >= COMPACT_ITEMS && 'hidden expanded:inline-flex',
            item.strong ? 'text-on-surface' : 'text-on-surface-variant',
            item.className,
          )}
        >
          <Icon name={item.icon} size={16} className="shrink-0 text-primary" />
          <span className={cn(compact && 'truncate')}>{item.dateTime ? <time dateTime={item.dateTime}>{item.label}</time> : item.label}</span>
        </li>
      ))}
    </ul>
  );
}
