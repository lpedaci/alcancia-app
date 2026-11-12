import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { IconButton } from '@/components/ui/IconButton';
import { toast } from '@/components/ui/toast-store';
import { DEMO_PERSON_IDS, findPerson, switchPerson } from '@/features/auth/auth-service';
import { can } from '@/lib/permissions';
import { useCurrentUser, useSessionStore } from '@/store/session-store';

/**
 * "Ver como" (CLAUDE.md principles, F0 and 5.0): always visible in the top bar. Lists the five demo
 * people (for participants, Mariana and Diego, each in their example state) and the demo mode
 * "Ver todo desbloqueado". Switching opens the chosen person's session without the second step.
 */
export function ViewAsMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const unlockAll = useSessionStore((s) => s.demoUnlockAll);
  if (!user || !can(user, 'demo.switchRole')) return null;
  const current = findPerson(user.personId);
  const firstName = current?.name.split(' ')[0] ?? '';

  const onChange = (personId: string) => {
    if (personId === user.personId) return;
    const path = switchPerson(personId);
    navigate(path);
    toast.info(t('demo.switched', { name: findPerson(personId)?.name ?? '' }));
  };

  return (
    <DropdownMenu>
      {/* Phones: icon only; IconButton gives it the full name and a tooltip. */}
      <DropdownMenuTrigger asChild>
        <IconButton icon="swap_horiz" label={t('demo.viewAsCurrent', { name: firstName })} variant="outlined" className="sm:hidden" />
      </DropdownMenuTrigger>
      <DropdownMenuTrigger asChild>
        <Button variant="outlined" size="xs" leadingIcon="swap_horiz" trailingIcon="keyboard_arrow_down" className="hidden min-w-0 shrink sm:inline-flex">
          <span className="truncate">{t('demo.viewAsCurrent', { name: firstName })}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent label={t('demo.viewAsMenu')} align="end">
        <DropdownMenuLabel>{t('demo.viewAsMenu')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={user.personId} onValueChange={onChange}>
          {DEMO_PERSON_IDS.map((personId) => (
            <DropdownMenuRadioItem key={personId} value={personId} description={t(`demo.people.${personId}`)}>
              {findPerson(personId)?.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={unlockAll}
          onCheckedChange={(value) => useSessionStore.getState().setDemoUnlockAll(value)}
          icon={unlockAll ? 'lock_open' : 'lock'}
          description={t('demo.unlockAllHelp')}
        >
          {t('demo.unlockAll')}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
