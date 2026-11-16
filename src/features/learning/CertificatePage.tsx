import { useTranslation } from 'react-i18next';
import { DEMO_TODAY } from '@/app/config';
import { Icon } from '@/components/ui/Icon';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { ListLinkRow } from '@/components/ui/ListLinkRow';
import { PrintButton } from '@/components/ui/PrintButton';
import { useLevels } from '@/features/levels/use-levels';
import { WalletShell } from '@/features/wallet/WalletShell';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { useDataStore, useOrganization, useProgram } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';
import { MODULES } from './questions';

/**
 * Certificate of completion of the program (F12, step 29, D-315): issued when levels 1 to 7 are
 * completed, with the person's name, the program, the organization, the modules with their badge and
 * the date. Never money, habits nor anything from the wallet. Before that, a labeled preview shows what
 * it will look like and what is missing. It prints or saves as a PDF with the browser. It is a demo
 * certificate with no official value; Open Badges metadata stays as a future line.
 */
const PROGRAM_LEVELS = [1, 2, 3, 4, 5, 6, 7];

export function CertificatePage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { statuses } = useLevels(personId);
  const person = useDataStore((s) => s.people.find((p) => p.id === personId));
  const attempts = useDataStore((s) => s.challengeAttempts).filter((a) => a.personId === personId);
  const program = useProgram();
  const organization = useOrganization();

  const levels = statuses.filter((s) => PROGRAM_LEVELS.includes(s.level.order));
  const missing = levels.filter((s) => s.status !== 'completed');
  const issued = levels.length > 0 && missing.length === 0;
  // Module badges (D-57), the same rule as the map of levels
  const badges = new Set<string>();
  for (const a of attempts) for (const [moduleId, score] of Object.entries(a.moduleScores)) if (a.score >= program.passingScore && score >= program.passingScore) badges.add(moduleId);
  const modules = MODULES.filter((m) => program.moduleIds.includes(m.id)).sort((a, b) => a.order - b.order);

  return (
    <WalletShell section={t('certificate.title')} fuerte={{ state: issued ? 'celebration' : 'neutral', message: t(issued ? 'certificate.fuerteIssued' : 'certificate.fuertePreview') }}>
      <div className="flex flex-col gap-(--space-section)">
        <header className="flex flex-col gap-2 print:hidden">
          <p className="text-label-large text-primary">{t('certificate.kicker')}</p>
          <h1 className="text-headline-medium text-on-surface">{t('certificate.title')}</h1>
          <p className="text-body-large text-on-surface-variant">{t('certificate.intro')}</p>
        </header>

        <div className="flex flex-col gap-4 print:hidden">
          {issued ? (
            <InlineAlert tone="success" title={t('certificate.issuedTitle')}>
              {t('certificate.issuedBody')}
            </InlineAlert>
          ) : (
            <InlineAlert tone="info" title={t('certificate.previewTitle')}>
              {t('certificate.previewBody', { count: missing.length })}{' '}
              {missing.map((s) => t('certificate.levelName', { n: s.level.order, name: t(`wallet.sections.${s.level.id}`) })).join(', ')}.
            </InlineAlert>
          )}
          {issued && <PrintButton label={t('certificate.print')} className="w-full medium:w-auto medium:self-end" />}
        </div>

        {/* The certificate: flat, framed with two lines of the palette; "Vista previa" until it is issued */}
        <article
          aria-labelledby="certificate-heading"
          className={cn(
            'relative mx-auto flex w-full max-w-3xl flex-col items-center gap-5 rounded-xl border-2 border-primary bg-surface-container-lowest p-2 text-center',
            'print:max-w-none print:border-on-surface',
          )}
        >
          <div className="flex w-full flex-col items-center gap-5 rounded-lg border border-outline-variant px-5 py-8 sm:px-10 sm:py-10">
            {!issued && (
              <p className="rounded-full bg-info-container px-3 py-1 text-label-large text-on-info-container">{t('certificate.previewChip')}</p>
            )}
            <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-tertiary text-on-tertiary">
              <Icon name="workspace_premium" size={24} filled />
            </span>
            <h2 id="certificate-heading" className="text-headline-small text-on-surface">
              {t('certificate.heading')}
            </h2>
            <p className="text-body-large text-on-surface-variant">{t('certificate.certifies')}</p>
            <p className="text-display-small text-primary">{person?.name ?? ''}</p>
            <p className="max-w-prose text-body-large text-on-surface">
              {t('certificate.completed', { program: program.name, organization: organization.name })}
            </p>
            <div className="@container flex w-full flex-col gap-3 border-t border-outline-variant pt-5 text-left">
              <h3 className="text-title-medium text-on-surface">{t('certificate.modules')}</h3>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 @xl:grid-cols-2">
                {modules.map((m) => {
                  const earned = badges.has(m.id);
                  return (
                    <li key={m.id} className="flex items-start gap-2 text-body-medium text-on-surface">
                      <Icon name={earned ? 'military_tech' : 'radio_button_unchecked'} size={18} filled={earned} className={cn('mt-0.5 shrink-0', earned ? 'text-tertiary' : 'text-on-surface-variant')} />
                      <span>
                        {t('certificate.module', { n: m.order, title: m.title })}
                        <span className="sr-only"> ({earned ? t('certificate.badgeEarned') : t('certificate.badgeMissing')})</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-body-small text-on-surface-variant">{t('certificate.badgesNote', { count: modules.filter((m) => badges.has(m.id)).length, total: modules.length })}</p>
            </div>
            <dl className="grid w-full grid-cols-1 gap-3 border-t border-outline-variant pt-5 text-left sm:grid-cols-2">
              <div className="flex flex-col">
                <dt className="text-body-small text-on-surface-variant">{t('certificate.date')}</dt>
                <dd className="text-title-small text-on-surface tabular-nums">{issued ? formatDate(DEMO_TODAY) : t('certificate.datePending')}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-body-small text-on-surface-variant">{t('certificate.issuer')}</dt>
                <dd className="text-title-small text-on-surface">{t('certificate.issuerValue', { organization: organization.name })}</dd>
              </div>
            </dl>
            <p className="text-body-small text-on-surface-variant">{t('certificate.disclaimer')}</p>
          </div>
        </article>

        <div className="print:hidden">
          <ListLinkRow to="/app/learn" icon="school" title={t('escape.backToLearn')} detail={t('escape.backToLearnDetail')} />
        </div>
      </div>
    </WalletShell>
  );
}
