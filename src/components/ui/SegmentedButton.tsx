import { ToggleGroup } from 'radix-ui';
import { cn } from '@/lib/utils';
import { interactive } from './Button';
import { Icon } from './Icon';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedButtonProps<T extends string> {
  /** Accessible name of the group, for example "Ver avance por". */
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}

/**
 * Segmented control for mutually exclusive options (2.1.3, D-295): a soft track in
 * surface-container with the chosen option raised on a white surface, with a check in primary
 * (the state never rests on color alone). Flat, no shadows. With `w-full` the options share the
 * width, each by its content; when they do not fit, the track scrolls inside itself and no label
 * is ever cut (2.7). Keyboard: arrow keys move between options (Radix ToggleGroup, single selection).
 */
export function SegmentedButton<T extends string>({
  label,
  options,
  value,
  onValueChange,
  className,
}: SegmentedButtonProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={label}
      value={value}
      onValueChange={(next) => {
        // Radix allows deselecting; a segmented button always keeps one option.
        if (next) onValueChange(next as T);
      }}
      className={cn('inline-flex w-fit max-w-full self-start gap-1 overflow-x-auto rounded-full bg-surface-container p-1 ring-1 ring-outline-variant ring-inset [scrollbar-width:thin]', className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            className={cn(
              'inline-flex h-10 shrink-0 grow items-center justify-center gap-1.5 rounded-full px-3.5 text-label-large whitespace-nowrap md:h-8',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary',
              interactive,
              selected ? 'bg-surface-container-lowest text-on-surface ring-1 ring-outline-variant' : 'text-on-surface-variant',
            )}
          >
            {selected && <Icon name="check" size={16} className="shrink-0 text-primary" />}
            <span>{option.label}</span>
          </ToggleGroup.Item>
        );
      })}
    </ToggleGroup.Root>
  );
}
