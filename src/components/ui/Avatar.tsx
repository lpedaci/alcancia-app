import type { Role } from '@/types/domain';
import { cn } from '@/lib/utils';

/** First letter of the first two words, for example "Mariana López" → "ML". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

/**
 * One color per role, used the same way everywhere (CLAUDE.md 2.1.1 and 2.2.1, pattern 6).
 * Alcancía never uses photos of people (2.2, F0): initials sit on the role container.
 */
export const ROLE_AVATAR_TONE: Record<Role, string> = {
  ld_admin: 'bg-role-org-admin-container text-on-surface',
  tutor: 'bg-role-tutor-container text-on-surface',
  participant: 'bg-role-participant-container text-on-surface',
  sponsor: 'bg-role-sponsor-container text-on-surface',
};

/** Role accent for cards and chips: solid bar, tinted chip and icon color. */
export const ROLE_ACCENT: Record<Role, { bar: string; chip: string; icon: string }> = {
  ld_admin: { bar: 'bg-role-org-admin', chip: 'bg-role-org-admin-container text-on-surface', icon: 'text-role-org-admin' },
  tutor: { bar: 'bg-role-tutor', chip: 'bg-role-tutor-container text-on-surface', icon: 'text-role-tutor' },
  participant: {
    bar: 'bg-role-participant',
    chip: 'bg-role-participant-container text-on-surface',
    icon: 'text-role-participant',
  },
  sponsor: { bar: 'bg-role-sponsor', chip: 'bg-role-sponsor-container text-on-surface', icon: 'text-role-sponsor' },
};

/** Decorative avatar: the name is always next to it, so it is hidden from assistive tech. */
export function Avatar({
  name,
  role,
  size = 'md',
  className,
}: {
  name: string;
  /** Platform role of the person: sets the color. */
  role?: Role;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const tone = role ? ROLE_AVATAR_TONE[role] : 'bg-surface-container-high text-on-surface';
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        size === 'sm' && 'size-8 text-label-medium',
        size === 'md' && 'size-10 text-label-large',
        size === 'lg' && 'size-12 text-title-medium',
        size === 'xl' && 'size-14 text-title-large',
        tone,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
