import { cn } from '@/lib/utils';
import { Button } from './Button';

/**
 * Prints the page or saves it as a PDF with the browser (RF-36, RF-64, D-207). The wallet hides its
 * navigation when printing and keeps the "dinero ficticio" notice; the button itself is not printed.
 * Collapsed sections (the assumptions of a simulator) open for the print, so the summary always
 * carries them, and close again afterwards.
 */
export function PrintButton({ label, className }: { label: string; className?: string }) {
  const print = () => {
    const closed = [...document.querySelectorAll<HTMLDetailsElement>('main details:not([open])')];
    for (const d of closed) d.open = true;
    window.print();
    for (const d of closed) d.open = false;
  };
  return (
    <Button variant="tonal" leadingIcon="print" className={cn('print:hidden', className)} onClick={print}>
      {label}
    </Button>
  );
}
