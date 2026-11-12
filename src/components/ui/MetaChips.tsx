import { Icon, type IconName } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

export interface MetaItem {
  icon: IconName;
  label: string;
  /** ISO date, when the item is a date: rendered as <time> (dates DD/MM/AAAA, 2.9). */
  dateTime?: string;
  /** Emphasis for the item that matters most (for example, the current level). */
  strong?: boolean;
}

/**
 * Context data of a page (date, program, organization, level): one row of white chips with an icon,
 * the same in the wallet and in the panels of every role (D-162). Color goes only to the icon, so
 * the chips read well on any surface without mixing tints.
 */
export function MetaChips({ items, label, className }: { items: MetaItem[]; label?: string; className?: string }) {
  return (
    <ul aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) => (
        <li
          key={item.label}
          className={cn(
            'inline-flex min-h-7 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-label-medium',
            item.strong ? 'text-on-surface' : 'text-on-surface-variant',
          )}
        >
          <Icon name={item.icon} size={16} className="shrink-0 text-primary" />
          {item.dateTime ? <time dateTime={item.dateTime}>{item.label}</time> : item.label}
        </li>
      ))}
    </ul>
  );
}
