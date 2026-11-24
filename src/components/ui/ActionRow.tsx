import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A row of actions (D-331): secondary actions first and on the left, the primary one last and on the
 * right, aligned to the end like dialogs. The order in the code is the order on screen, so the keyboard
 * reaches the actions as they are seen. Below 600 px they stack full width with the primary on top (D-308).
 *
 * `start` keeps a "back" or "exit" action apart on the far left, as in steps and the privacy notice.
 */
export function ActionRow({ children, start, className }: { children: ReactNode; start?: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-3 medium:flex-row medium:flex-wrap medium:items-center medium:justify-end',
        'max-medium:[&>*]:w-full',
        className,
      )}
    >
      {start && <div className="flex max-medium:w-full medium:mr-auto [&>*]:max-medium:w-full">{start}</div>}
      {children}
    </div>
  );
}
