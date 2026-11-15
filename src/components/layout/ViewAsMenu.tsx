import { useState } from 'react';
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
import { DEMO_CONTEXTS, findPerson, switchPerson } from '@/features/auth/auth-service';
import { useOrgKind } from '@/lib/org-context';
import type { OrganizationKind } from '@/types/domain';
import { can } from '@/lib/permissions';
import { useCurrentUser, useSessionStore } from '@/store/session-store';
import { DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { HORNERO_HOME } from '@/features/partner/partner-mode';

/**
 * "Ver como" (CLAUDE.md principles, F0, 5.0 and 5.5): always visible in the top bar. First the context
 * (organization, educational institution or product), then its demo people (in Andina, Mariana and
 * Diego each in their example state), and the demo mode "Ver todo desbloqueado". Choosing a context
 * keeps the menu open; switching person opens their session without the second step.
 */
const CONTEXT_ICON = { employer: 'apartment', education: 'school', product: 'mobile' } as const;

export function ViewAsMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const unlockAll = useSessionStore((s) => s.demoUnlockAll);
  const kind = useOrgKind();
  const [context, setContext] = useState<OrganizationKind>(kind);
  if (!user || !can(user, 'demo.switchRole')) return null;
  const people = DEMO_CONTEXTS.find((c) => c.kind === context)?.personIds ?? [];
  const current = findPerson(user.personId);
  const firstName = current?.name.split(' ')[0] ?? '';

  const onChange = (personId: string) => {
    if (personId === user.personId) return;
    const path = switchPerson(personId);
    navigate(path);
    toast.info(t('demo.switched', { name: findPerson(personId)?.name ?? '' }));
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && setContext(kind)}>
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
        <DropdownMenuLabel>{t('demo.contextLabel')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={context} onValueChange={(v) => setContext(v as OrganizationKind)}>
          {DEMO_CONTEXTS.map((c) => (
            <DropdownMenuRadioItem key={c.kind} value={c.kind} icon={CONTEXT_ICON[c.kind]} description={t(`contexts.orgs.${c.kind}`)} keepOpen>
              {t(`contexts.${c.kind}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('demo.viewAsMenu')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={user.personId} onValueChange={onChange}>
          {people.map((personId) => (
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
        {user.role === 'participant' && (
          <DropdownMenuItem icon="open_in_new" description={t('demo.partnerHorneroHelp')} onSelect={() => navigate(HORNERO_HOME)}>
            {t('demo.partnerHornero')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
