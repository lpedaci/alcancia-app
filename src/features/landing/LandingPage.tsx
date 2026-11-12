import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Logo } from '@/components/layout/Logo';
import { Avatar, ROLE_ACCENT } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { CASE_STUDY_URL, DOCS_URL, GITHUB_PROFILE_URL, LINKEDIN_URL, PORTFOLIO_URL } from '@/app/links';
import levels from '@/data/levels.json';
import seed from '@/data/seed.json';
import { FuerteMessage } from '@/features/companion/FuerteMessage';
import { InflationSimulator } from '@/features/simulators/InflationSimulator';
import { cn } from '@/lib/utils';
import type { Role } from '@/types/domain';
import {
  PieceFuerte,
  PieceGoal,
  PieceKpi,
  PieceLevelMap,
  PieceSimResult,
  SceneBudget,
  SceneCard,
  SceneInflation,
} from './ProductPieces';

/**
 * G0 · Landing (CLAUDE.md F0, 1.3): the B2B product page structure of Rumbo, presenting Alcancía
 * as "la billetera donde tu equipo aprende finanzas usándola". SIM-3 works without a session.
 * Figures are computed from the demo data, never typed by hand.
 */
const NAV = [
  ['problema', 'nav.problem'],
  ['solucion', 'nav.solution'],
  ['recorridos', 'nav.roles'],
  ['simulador', 'nav.simulator'],
  ['preguntas', 'nav.faq'],
] as const;

const ROLES: { id: string; demo: string; name: string; role: Role }[] = [
  { id: 'mariana', demo: 'mariana', name: 'Mariana López', role: 'participant' },
  { id: 'diego', demo: 'diego', name: 'Diego Suárez', role: 'participant' },
  { id: 'andres', demo: 'andres', name: 'Andrés Molina', role: 'tutor' },
  { id: 'paula', demo: 'paula', name: 'Paula Gómez', role: 'ld_admin' },
  { id: 'ricardo', demo: 'ricardo', name: 'Ricardo Benítez', role: 'sponsor' },
];

const SOLUTION: { key: string; icon: IconName; wide?: boolean }[] = [
  { key: 'diagnostic', icon: 'route', wide: true },
  { key: 'guides', icon: 'menu_book' },
  { key: 'challenges', icon: 'quiz' },
  { key: 'tools', icon: 'calculate' },
  { key: 'goals', icon: 'savings' },
  { key: 'panel', icon: 'query_stats', wide: true },
];

function Section({
  id,
  children,
  tone = 'surface',
  className,
}: {
  id: string;
  children: ReactNode;
  tone?: 'surface' | 'white';
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn('scroll-mt-24 py-16 md:py-20', tone === 'white' ? 'bg-surface-container-lowest' : 'bg-surface', className)}
    >
      <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-8 px-(--space-gutter)">{children}</div>
    </section>
  );
}

function SectionTitle({ id, eyebrow, title, intro }: { id: string; eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="flex max-w-3xl flex-col gap-3">
      <p className="text-label-large text-primary">{eyebrow}</p>
      <h2 id={`${id}-title`} className="text-title-large text-balance text-on-surface md:text-display-small">
        {title}
      </h2>
      {intro && <p className="text-body-large text-on-surface-variant">{intro}</p>}
    </div>
  );
}

function External({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const { t } = useTranslation();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> {t('landing.newTab')}</span>
    </a>
  );
}

export function LandingPage() {
  const { t } = useTranslation();
  const participants = seed.people.filter((p) => p.role === 'participant').length;
  const phaseA = levels.filter((l) => l.phase === 'A');
  const missions = new Set(phaseA.flatMap((l) => l.missionIds)).size;
  const tools = new Set(phaseA.flatMap((l) => l.toolSimIds)).size;
  const figures = [
    [String(phaseA.length), 'landing.figures.levels'],
    [String(missions), 'landing.figures.missions'],
    [String(tools), 'landing.figures.tools'],
    [String(participants), 'landing.figures.people'],
  ] as const;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only rounded-sm bg-surface-container-lowest px-4 py-3 text-label-large text-primary focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:shadow-elevation-1"
      >
        {t('app.skipToContent')}
      </a>

      {/* 1 · Floating top bar */}
      <header className="sticky top-0 z-40 px-(--space-gutter) pt-3">
        <div className="mx-auto flex max-w-[75rem] items-center justify-between gap-3 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2 shadow-elevation-1">
          <Link to="/" aria-label={t('landing.homeLabel')} className="rounded-sm">
            <Logo />
          </Link>
          <nav aria-label={t('landing.nav.label')} className="hidden large:block">
            <ul className="flex items-center gap-1">
              {NAV.map(([id, key]) => (
                <li key={id}>
                  <a href={`#${id}`} className="rounded-full px-3 py-2 text-label-large text-on-surface-variant hover:bg-surface-container hover:text-on-surface">
                    {t(`landing.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Button asChild size="s">
            <a href="#recorridos">{t('landing.chooseJourney')}</a>
          </Button>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* 2 · Hero */}
        <section aria-labelledby="hero-title" className="relative overflow-hidden bg-surface-container-lowest pt-14 pb-16 md:pt-20 md:pb-24">
          <div className="mx-auto grid max-w-[75rem] items-center gap-10 px-(--space-gutter) xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,15rem)]">
            <div className="hidden flex-col gap-4 xl:flex" aria-hidden>
              <PieceSimResult />
              <PieceKpi />
            </div>
            <div className="flex flex-col items-center gap-6 text-center">
              <p className="rounded-full bg-primary-container px-4 py-1.5 text-label-medium text-balance text-on-primary-container">
                {t('landing.eyebrow')}
              </p>
              <h1 id="hero-title" className="max-w-3xl text-headline-small text-balance text-on-surface md:text-display-small xl:text-display-medium">
                {t('landing.hero.titleStart')} <span className="text-primary">{t('landing.hero.titleKey')}</span>{' '}
                {t('landing.hero.titleEnd')}
              </h1>
              <p className="max-w-2xl text-body-large text-on-surface-variant">{t('landing.hero.body')}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="m">
                  <a href="#recorridos">{t('landing.chooseJourney')}</a>
                </Button>
                <Button asChild size="m" variant="outlined" trailingIcon="open_in_new">
                  <External href={CASE_STUDY_URL}>{t('landing.hero.caseStudy')}</External>
                </Button>
              </div>
              <FuerteMessage state="greeting" lights={3} size={4} className="mt-2 max-w-md text-left">
                {t('landing.hero.fuerte')}
              </FuerteMessage>
            </div>
            <div className="hidden flex-col gap-4 xl:flex" aria-hidden>
              <PieceGoal />
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                <p className="text-label-medium text-on-surface-variant">{t('landing.pieces.practice')}</p>
                <p className="mt-1 text-body-medium text-on-surface">{t('landing.pieces.practiceBody')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3 · The problem */}
        <Section id="problema">
          <SectionTitle id="problema" eyebrow={t('landing.problem.eyebrow')} title={t('landing.problem.title')} />
          <ul className="grid grid-cols-1 gap-(--space-bento-gap) md:grid-cols-3">
            {(
              [
                ['budget', 'account_balance_wallet', <SceneBudget key="b" />],
                ['inflation', 'trending_down', <SceneInflation key="i" />],
                ['card', 'credit_card', <SceneCard key="c" />],
              ] as const
            ).map(([key, icon, scene]) => (
              <li key={key} className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)">
                <IconTile icon={icon} tone="secondary" />
                <h3 className="text-title-medium text-on-surface">{t(`landing.problem.${key}.title`)}</h3>
                <p className="text-body-medium text-on-surface-variant">{t(`landing.problem.${key}.body`)}</p>
                <div className="mt-auto rounded-lg bg-surface p-3">{scene}</div>
              </li>
            ))}
          </ul>
        </Section>

        {/* 4 · The solution */}
        <Section id="solucion" tone="white">
          <SectionTitle
            id="solucion"
            eyebrow={t('landing.solution.eyebrow')}
            title={t('landing.solution.title')}
            intro={t('landing.solution.intro')}
          />
          <ul className="grid grid-cols-1 gap-(--space-bento-gap) md:grid-cols-6 large:grid-cols-12">
            {SOLUTION.map(({ key, icon, wide }) => (
              <li
                key={key}
                className={cn(
                  'flex min-w-0 flex-col gap-3 rounded-xl border border-outline-variant bg-surface p-(--space-card-padding)',
                  wide ? 'md:col-span-6 large:col-span-6' : 'md:col-span-3 large:col-span-3',
                )}
              >
                <IconTile icon={icon} tone={key === 'goals' ? 'tertiary' : 'primary'} />
                <h3 className="text-title-medium text-on-surface">{t(`landing.solution.${key}.title`)}</h3>
                <p className="text-body-medium text-on-surface-variant">{t(`landing.solution.${key}.body`)}</p>
                {key === 'diagnostic' && (
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-4 rounded-lg bg-surface-container-lowest p-3">
                    <PieceLevelMap />
                    <PieceFuerte />
                  </div>
                )}
                {key === 'panel' && <PieceKpi className="mt-auto" />}
              </li>
            ))}
          </ul>
        </Section>

        {/* 5 · Learn anywhere */}
        <Section id="cualquier-lugar">
          <SectionTitle id="cualquier-lugar" eyebrow={t('landing.anywhere.eyebrow')} title={t('landing.anywhere.title')} intro={t('landing.anywhere.intro')} />
          <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
            <figure className="flex min-w-0 flex-col gap-3">
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4" aria-hidden>
                <div className="mb-3 flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-outline-variant" />
                  <span className="size-2.5 rounded-full bg-outline-variant" />
                  <span className="size-2.5 rounded-full bg-outline-variant" />
                </div>
                <GuidePreview />
              </div>
              <figcaption className="text-body-small text-on-surface-variant">{t('landing.anywhere.desktop')}</figcaption>
            </figure>
            <figure className="mx-auto flex w-full max-w-64 flex-col gap-3">
              <div className="rounded-xl border-4 border-on-surface bg-surface-container-lowest p-3" aria-hidden>
                <GuidePreview compact />
              </div>
              <figcaption className="text-body-small text-on-surface-variant">{t('landing.anywhere.mobile')}</figcaption>
            </figure>
          </div>
        </Section>

        {/* 6 · One journey per role */}
        <Section id="recorridos" tone="white">
          <SectionTitle id="recorridos" eyebrow={t('landing.roles.eyebrow')} title={t('landing.roles.title')} intro={t('landing.roles.intro')} />
          <ul className="grid grid-cols-1 gap-(--space-bento-gap) md:grid-cols-2 large:grid-cols-3">
            {ROLES.map((r) => (
              <li key={r.id} className="flex min-w-0 flex-col gap-3 rounded-xl border border-outline-variant bg-surface p-(--space-card-padding)">
                <div className="flex items-center gap-3">
                  <Avatar name={r.name} role={r.role} size="lg" />
                  <div className="min-w-0">
                    <h3 className="text-title-medium text-on-surface">{r.name}</h3>
                    <span className={cn('mt-1 inline-flex rounded-full px-2 py-0.5 text-label-medium', ROLE_ACCENT[r.role].chip)}>
                      {t(`landing.roles.${r.id}.chip`)}
                    </span>
                  </div>
                </div>
                <p className="text-body-medium text-on-surface">{t(`landing.roles.${r.id}.does`)}</p>
                <p className="text-body-small text-on-surface-variant">{t(`landing.roles.${r.id}.explore`)}</p>
                <Button asChild variant="tonal" className="mt-auto self-start" trailingIcon="arrow_forward">
                  <Link to={`/login?demo=${r.demo}`}>{t('landing.roles.cta', { name: r.name.split(' ')[0] })}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </Section>

        {/* 7 · Try a simulator without signing in */}
        <Section id="simulador">
          <SectionTitle id="simulador" eyebrow={t('landing.simulator.eyebrow')} title={t('landing.simulator.title')} intro={t('landing.simulator.intro')} />
          <InflationSimulator headingLevel="h3" idPrefix="g0-sim3" />
        </Section>

        {/* 8 · Figures from the demo data */}
        <section aria-labelledby="cifras-title" className="bg-primary-container py-14">
          <div className="mx-auto flex max-w-[75rem] flex-col gap-6 px-(--space-gutter)">
            <h2 id="cifras-title" className="text-title-large text-on-primary-container">
              {t('landing.figures.title')}
            </h2>
            <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {figures.map(([value, key]) => (
                <div key={key} className="flex flex-col-reverse gap-1">
                  <dt className="text-body-medium text-on-primary-container">{t(key)}</dt>
                  <dd className="text-display-small text-on-primary-container tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 9 · Three steps and FAQ */}
        <Section id="preguntas" tone="white">
          <SectionTitle id="preguntas" eyebrow={t('landing.steps.eyebrow')} title={t('landing.steps.title')} />
          <ol className="grid grid-cols-1 gap-(--space-bento-gap) md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface p-(--space-card-padding)">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-label-large text-on-primary">{n}</span>
                <h3 className="text-title-medium text-on-surface">{t(`landing.steps.s${n}.title`)}</h3>
                <p className="text-body-medium text-on-surface-variant">{t(`landing.steps.s${n}.body`)}</p>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-3">
            <h3 className="text-title-large text-on-surface">{t('landing.faq.title')}</h3>
            <div className="flex flex-col divide-y divide-outline-variant rounded-xl border border-outline-variant bg-surface-container-lowest">
              {[1, 2, 3, 4, 5].map((n) => (
                <details key={n} className="group">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-(--space-card-padding) py-3 text-title-small text-on-surface">
                    {t(`landing.faq.q${n}`)}
                    <Icon name="keyboard_arrow_down" className="shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="max-w-prose px-(--space-card-padding) pb-4 text-body-medium text-on-surface-variant">{t(`landing.faq.a${n}`)}</p>
                </details>
              ))}
            </div>
          </div>
        </Section>

        {/* 10 · Final band */}
        <section aria-labelledby="final-title" className="bg-inverse-surface py-14 text-inverse-on-surface">
          <div className="mx-auto flex max-w-[75rem] flex-col items-start gap-5 px-(--space-gutter) md:flex-row md:items-center md:justify-between">
            <h2 id="final-title" className="max-w-xl text-title-large text-balance md:text-headline-small">
              {t('landing.final.title')}
            </h2>
            <Button asChild size="m" variant="tonal">
              <a href="#recorridos">{t('landing.chooseJourney')}</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-surface-container-lowest">
        <div className="mx-auto grid max-w-[75rem] grid-cols-1 gap-8 px-(--space-gutter) py-12 md:grid-cols-4">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="text-body-small text-on-surface-variant">{t('landing.footer.tagline')}</p>
          </div>
          <nav aria-labelledby="footer-explore" className="flex flex-col gap-2">
            <h2 id="footer-explore" className="text-title-small text-on-surface">{t('landing.footer.explore')}</h2>
            {NAV.map(([id, key]) => (
              <a key={id} href={`#${id}`} className="w-fit text-body-medium text-on-surface-variant underline-offset-4 hover:underline">
                {t(`landing.${key}`)}
              </a>
            ))}
          </nav>
          <nav aria-labelledby="footer-project" className="flex flex-col gap-2">
            <h2 id="footer-project" className="text-title-small text-on-surface">{t('landing.footer.project')}</h2>
            <External href={CASE_STUDY_URL} className="w-fit text-body-medium text-on-surface-variant underline-offset-4 hover:underline">
              {t('landing.footer.caseStudy')}
            </External>
            <External href={DOCS_URL} className="w-fit text-body-medium text-on-surface-variant underline-offset-4 hover:underline">
              {t('landing.footer.docs')}
            </External>
          </nav>
          <nav aria-labelledby="footer-demo" className="flex flex-col gap-2">
            <h2 id="footer-demo" className="text-title-small text-on-surface">{t('landing.footer.demo')}</h2>
            <Link to="/login?demo=mariana" className="w-fit text-body-medium text-on-surface-variant underline-offset-4 hover:underline">
              {t('landing.roles.cta', { name: 'Mariana' })}
            </Link>
            <Link to="/login?demo=diego" className="w-fit text-body-medium text-on-surface-variant underline-offset-4 hover:underline">
              {t('landing.roles.cta', { name: 'Diego' })}
            </Link>
          </nav>
        </div>
        <div className="border-t border-outline-variant">
          <div className="mx-auto flex max-w-[75rem] flex-col gap-3 px-(--space-gutter) py-6 text-body-small text-on-surface-variant md:flex-row md:items-center md:justify-between">
            <p>
              {t('landing.footer.credit')}{' '}
              <External href={LINKEDIN_URL} className="text-primary underline underline-offset-4">LinkedIn</External>
              {' · '}
              <External href={PORTFOLIO_URL} className="text-primary underline underline-offset-4">{t('landing.footer.portfolio')}</External>
              {' · '}
              <External href={GITHUB_PROFILE_URL} className="text-primary underline underline-offset-4">GitHub</External>
            </p>
            <p>{t('landing.disclaimer')} © 2026</p>
          </div>
        </div>
      </footer>
    </>
  );
}

/** The same guide on a computer and on a phone (F0, section 5). */
function GuidePreview({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <div className="h-1.5 w-full rounded-full bg-surface-container">
        <div className="h-1.5 w-2/5 rounded-full bg-primary" />
      </div>
      <p className="text-label-medium text-primary">{t('landing.anywhere.guideKicker')}</p>
      <p className={cn('text-on-surface', compact ? 'text-title-small' : 'text-title-medium')}>{t('landing.anywhere.guideTitle')}</p>
      <p className="text-body-small text-on-surface-variant">{t('landing.anywhere.guideBody')}</p>
      <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-2')}>
        <span className="rounded-md border border-primary bg-primary-container px-3 py-2 text-label-medium text-on-primary-container">
          {t('landing.anywhere.optionA')}
        </span>
        <span className="rounded-md border border-outline-variant px-3 py-2 text-label-medium text-on-surface">
          {t('landing.anywhere.optionB')}
        </span>
      </div>
    </div>
  );
}
