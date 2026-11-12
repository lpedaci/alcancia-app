import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges conditional class names and resolves Tailwind conflicts (shadcn/ui convention).
 * Step 2 extends tailwind-merge with the M3 type roles and elevation tokens.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
