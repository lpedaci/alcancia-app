import { useTranslation } from 'react-i18next';

/** Data of the practice account (P2, P14): all fictitious, never asked to the person (5.3). */
export function AccountData({ name }: { name: string }) {
  const { t } = useTranslation();
  const first = name.split(' ')[0]?.toLowerCase() ?? '';
  return (
    <dl className="grid grid-cols-1 gap-2 rounded-lg bg-surface-container p-4 text-body-medium sm:grid-cols-[auto_1fr] sm:gap-x-6">
      <dt className="text-on-surface-variant">{t('welcome.account.name')}</dt>
      <dd className="text-on-surface">{name}</dd>
      <dt className="text-on-surface-variant">{t('welcome.account.alias')}</dt>
      <dd className="break-all text-on-surface">alcancia.practica.{first}</dd>
      <dt className="text-on-surface-variant">{t('welcome.account.cvu')}</dt>
      <dd className="text-on-surface tabular-nums">0000000 0000000 EJEMPLO 00</dd>
      <dt className="text-on-surface-variant">{t('welcome.account.employer')}</dt>
      <dd className="text-on-surface">Andina Servicios S.A.</dd>
    </dl>
  );
}
