import { cn } from '@/lib/utils';

/**
 * Hornero mark (D-85, D-86): the bird's oven-shaped nest seen from the side, rounded, with its
 * entrance visible, resting on a branch. Drawn from scratch for this demo, monochrome
 * (currentColor) and legible at 24 px. Not based on any real brand or third-party image.
 */
export function HorneroMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('shrink-0', className)}
    >
      {/* Dome with the arched entrance cut out (even-odd) */}
      <path
        fillRule="evenodd"
        d="M3 18.5C3 10.9 7.4 4.5 13 4.5c4.9 0 8 4.4 8 9.6v4.4H3ZM8 18.5v-3.6a2.5 2.5 0 0 1 5 0v3.6Z"
      />
      {/* Branch */}
      <rect x="1.5" y="19.5" width="21" height="1.75" rx="0.875" />
    </svg>
  );
}
