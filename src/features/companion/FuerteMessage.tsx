import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Fuerte, type FuerteState } from './Fuerte';

/**
 * Fuerte talking (5.0.1): the drawing is decorative and the message is announced as text, at most
 * two sentences. `live` makes it polite live region for messages that appear after an action.
 */
export function FuerteMessage({
  state = 'neutral',
  lights = 0,
  children,
  live = false,
  size = 3.5,
  className,
}: {
  state?: FuerteState;
  lights?: number;
  children: ReactNode;
  live?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-end gap-3', className)}>
      <Fuerte state={state} lights={lights} size={size} />
      <p
        {...(live ? { role: 'status', 'aria-live': 'polite' as const } : {})}
        className="relative min-w-0 flex-1 rounded-lg rounded-bl-xs border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-medium text-on-surface"
      >
        <span className="sr-only">Fuerte: </span>
        {children}
      </p>
    </div>
  );
}
