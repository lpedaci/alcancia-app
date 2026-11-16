import { useTranslation } from 'react-i18next';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { ListLinkRow } from '@/components/ui/ListLinkRow';
import { fuerteLine } from '@/features/companion/fuerte-lines';
import { WhyMatters, whyText } from '@/features/learning-cards/WhyMatters';
import { guidesOfModule } from '@/features/learning/questions';
import { UnlockCard } from '@/features/levels/UnlockCard';
import { LEVELS, useLevels } from '@/features/levels/use-levels';
import { WalletShell } from '@/features/wallet/WalletShell';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser } from '@/store/session-store';

/**
 * Nivel 8 · Cripto (F22, D-302), inside Invertir: concepts, risks and custody only (1.2). There is
 * nothing to buy here, on purpose: the level is the three guides of module 16, its challenge and where
 * to verify a provider. It opens when level 7 is completed (its guides, including risk and horizon,
 * and its challenge).
 */
const LEVEL_ID = 'level-8';
const card = 'flex min-w-0 flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

export function CryptoPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const personId = user?.personId ?? '';
  const { statuses, isOpen } = useLevels(personId);
  const allGuides = useDataStore((s) => s.guideProgress);
  const status = statuses.find((s) => s.level.id === LEVEL_ID);
  const section = t('wallet.sections.level-8');

  const titleRow = (title: string) => (
    // Title row (D-292): the title on the left, "¿Por qué importa?" on the right
    <div className="flex items-center justify-between gap-3">
      <h1 className="text-headline-medium text-on-surface">{title}</h1>
      <WhyMatters screen="crypto" />
    </div>
  );

  if (status && !isOpen(LEVEL_ID)) {
    return (
      <WalletShell section={section} fuerte={{ state: 'thinking', message: fuerteLine('crypto.fuerte.locked') }}>
        <div className="flex flex-col gap-6">
          {titleRow(t('wallet.placeholder.lockedTitle', { section }))}
          <UnlockCard status={status} />
        </div>
      </WalletShell>
    );
  }

  const level = LEVELS.find((l) => l.id === LEVEL_ID)!;
  const guideDone = (id: string) => allGuides.some((g) => g.personId === personId && g.guideIdsDone.includes(id));
  const guides = level.guideModuleIds.flatMap((moduleId) => guidesOfModule(moduleId));

  return (
    <WalletShell section={section} fuerte={{ state: 'neutral', message: fuerteLine('crypto.fuerte.home'), why: whyText('crypto') }}>
      <div className="flex flex-col gap-(--space-bento-gap)">
        <header className="flex flex-col gap-2">
          {titleRow(section)}
          <p className="text-body-large text-on-surface-variant">{t('crypto.intro')}</p>
        </header>

        {/* Education, not advice (1.2): no buying, no "how much" nor "which" */}
        <InlineAlert tone="info" live="none">
          {t('crypto.notice')}
        </InlineAlert>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) large:grid-cols-2 large:items-start">
          <section aria-labelledby="crypto-learn" className={card}>
            <h2 id="crypto-learn" className="text-title-large text-on-surface">
              {t('pay.learn.title')}
            </h2>
            <ul className="flex flex-col gap-2">
              {guides.map((g) => (
                <li key={g.id}>
                  <ListLinkRow
                    to={`/app/learn/guides/${g.id}`}
                    icon={guideDone(g.id) ? 'check_circle' : 'menu_book'}
                    title={g.title}
                    detail={t('pay.learn.guideMeta', { minutes: g.minutes }) + (guideDone(g.id) ? ` · ${t('learn.map.done')}` : '')}
                  />
                </li>
              ))}
              {level.challengeId && (
                <li>
                  <ListLinkRow to={`/app/learn/challenges/${level.challengeId}`} icon="quiz" title={t('crypto.challenge')} detail={t('crypto.challengeDetail')} />
                </li>
              )}
            </ul>
          </section>

          <section aria-labelledby="crypto-verify" className={card}>
            <h2 id="crypto-verify" className="text-title-large text-on-surface">
              {t('crypto.verifyTitle')}
            </h2>
            <p className="text-body-medium text-on-surface-variant">{t('crypto.verifyBody')}</p>
            <ul className="flex flex-col gap-2">
              <li>
                <ListLinkRow to="/app/learn/sources" icon="verified_user" title={t('crypto.verifyRegistry')} detail={t('crypto.verifyRegistryDetail')} />
              </li>
              <li>
                <ListLinkRow to="/app/invest" icon="trending_up" title={t('crypto.backToInvest')} detail={t('crypto.backToInvestDetail')} />
              </li>
            </ul>
          </section>
        </div>
      </div>
    </WalletShell>
  );
}
