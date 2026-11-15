import { type HTMLAttributes, type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes, useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TableContainerProps {
  /** Accessible name of the scroll region, for example "Ingresos". */
  label: string;
  children: ReactNode;
  className?: string;
  /** D-297: the table inside turns into cards when the container is narrow (pair with `<Table stack>`). */
  stack?: boolean;
}

/**
 * Keeps any horizontal scroll inside the table, never on the page (2.7).
 * Focusable so keyboard users can scroll it. Listings switch to cards on mobile
 * (pattern implemented with each listing, from step 7).
 */
export function TableContainer({ label, children, className, stack }: TableContainerProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn('relative w-full max-w-full overflow-x-auto rounded-md border border-outline-variant max-lg:scrollbar-none', stack && '[container:table-stack/inline-size]', className)}
    >
      {children}
    </div>
  );
}

/**
 * `stack` (D-297): below 42rem of container, each row is a card. Every cell gets its column name as
 * `data-label` from the header, and the table keeps explicit roles so it is still read as a table
 * when its display changes.
 */
export function Table({ className, stack, ...props }: HTMLAttributes<HTMLTableElement> & { stack?: boolean }) {
  const ref = useRef<HTMLTableElement>(null);
  useLayoutEffect(() => {
    const table = ref.current;
    if (!stack || !table) return;
    const headers = [...table.querySelectorAll('thead th')].map((th) => th.textContent?.trim() ?? '');
    table.setAttribute('role', 'table');
    table.querySelectorAll('tr').forEach((tr) => {
      tr.setAttribute('role', 'row');
      let column = 0;
      [...tr.children].forEach((cell) => {
        const span = Number(cell.getAttribute('colspan') ?? 1);
        if (cell.tagName === 'TH') cell.setAttribute('role', cell.getAttribute('scope') === 'row' ? 'rowheader' : 'columnheader');
        else {
          cell.setAttribute('role', 'cell');
          // A cell that spans columns (for example "Datos insuficientes") has no single column name
          if (span === 1 && headers[column]) cell.setAttribute('data-label', headers[column]!);
        }
        column += span;
      });
    });
    table.querySelectorAll('thead, tbody').forEach((g) => g.setAttribute('role', 'rowgroup'));
  });
  return <table ref={ref} className={cn('w-full border-collapse text-left', stack && 'table-stack', className)} {...props} />;
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-surface-container', className)} {...props} />;
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-outline-variant transition-colors duration-150 last:border-b-0 [tbody_&]:hover:bg-surface-container-high',
        className,
      )}
      {...props}
    />
  );
}

export function TableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn('px-4 py-2.5 text-title-small whitespace-nowrap text-on-surface-variant', className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 text-body-medium text-on-surface', className)} {...props} />;
}
