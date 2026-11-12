import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { findPerson, resetDemo, signOut } from '@/features/auth/auth-service';
import { can } from '@/lib/permissions';
import { useCurrentUser } from '@/store/session-store';

/**
 * Avatar menu of the top bar (CLAUDE.md 5.3 and 7): "Restablecer demo" with confirmation and
 * "Cerrar sesión". The participant's profile (P14) joins it in step 6.
 */
export function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [confirmReset, setConfirmReset] = useState(false);
  const person = user ? findPerson(user.personId) : undefined;
  if (!user || !person) return null;

  return (
    <>
      <DropdownMenu>
        {/* The name comes from hidden text, so it never mismatches the visible initials (WCAG 2.5.3). */}
        <DropdownMenuTrigger className="min-h-12 min-w-12 rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary md:min-h-0 md:min-w-0">
          <span className="sr-only">{t('demo.userMenu', { name: person.name })}</span>
          <Avatar name={person.name} role={person.role} size="md" />
        </DropdownMenuTrigger>
        <DropdownMenuContent label={t('demo.userMenu', { name: person.name })} align="end">
          <DropdownMenuLabel>
            <span className="block truncate text-title-small text-on-surface">{person.name}</span>
            <span className="block text-body-small break-all text-on-surface-variant">{person.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* "Perfil, seguridad y comprobantes" (P14) joins this menu in step 6. */}
          {can(user, 'demo.reset') && (
            <DropdownMenuItem icon="restart_alt" onSelect={() => setConfirmReset(true)}>
              {t('demo.reset')}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            icon="logout"
            onSelect={() => {
              signOut('manual');
              navigate('/login', { replace: true });
            }}
          >
            {t('demo.signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={t('demo.resetTitle')}
        description={t('demo.resetBody')}
        confirmLabel={t('demo.reset')}
        onConfirm={() => {
          resetDemo();
          navigate('/login', { replace: true });
        }}
      />
    </>
  );
}
