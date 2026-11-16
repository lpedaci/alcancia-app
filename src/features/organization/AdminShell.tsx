import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StaffShell } from '@/components/layout/StaffShell';

/** Layout of the L&D admin (D-195): the shared staff layout with Panel, Personas y cohortes and Programa. */
export function AdminShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <StaffShell
      home="/admin"
      navLabel={t('org.nav.label')}
      nav={[
        {
          key: 'panel',
          to: '/admin',
          icon: 'dashboard',
          label: t('org.nav.panel'),
          match: (p) => p === '/admin',
        },
        {
          key: 'people',
          to: '/admin/people',
          icon: 'groups',
          label: t('org.nav.people'),
          match: (p) => p.startsWith('/admin/people'),
        },
        {
          key: 'activity',
          to: '/admin/activity',
          icon: 'timeline',
          label: t('org.nav.activity'),
          match: (p) => p.startsWith('/admin/activity'),
        },
        {
          key: 'lessons',
          to: '/admin/lessons',
          icon: 'edit_note',
          label: t('org.nav.lessons'),
          match: (p) => p.startsWith('/admin/lessons'),
        },
        {
          key: 'program',
          to: '/admin/program',
          icon: 'settings',
          label: t('org.nav.program'),
          match: (p) => p.startsWith('/admin/program'),
        },
      ]}
    >
      {children}
    </StaffShell>
  );
}
