import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { CASE_STUDY_URL, DOCS_URL, GITHUB_PROFILE_URL, LINKEDIN_URL, PORTFOLIO_URL } from '@/app/links';
import { Logo } from '@/components/layout/Logo';
import { Avatar, ROLE_ACCENT } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SegmentedButton } from '@/components/ui/SegmentedButton';
import levels from '@/data/levels.json';
import seed from '@/data/seed.json';
import { InflationSimulator } from '@/features/simulators/InflationSimulator';
import { installmentsPresentValue } from '@/lib/finance';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { Role } from '@/types/domain';
import { AppPhone, AppTopBar, BottomNav, type PhoneScreen, PhoneFrame, StatusBar } from './PhoneMockup';
import { PieceGoal, PieceKpi, PieceLevelMap, PieceSimResult, SceneBudget, SceneCard, SceneInflation } from './ProductPieces';
import { ResetDemoButton } from './ResetDemoButton';
import { CountUp, Reveal } from './Reveal';

/**
 * G0 · Landing (CLAUDE.md F0, 1.3), redesigned from the Payora and Finotive references
 * (docs/visual-audit.md, D-150): left-aligned hero with the key words underlined and the app on a
 * real-size phone with real screens and feature cards around it; the demo figures as a band; centered
 * section titles with a pill; the solution as alternating feature rows with a numbered list; tinted
 * cards for the problem. Scroll reveals and staggered lists (2.6), opacity only with reduced motion.
 * Not taken: gradients, glows, soft shadows and "trusted by" logos (F0). SIM-3 works without a
 * session; figures come from the demo data, never typed by hand.
 */
const NAV = [
  ['problema', 'nav.problem'],
  ['solucion', 'nav.solution'],
  ['recorridos', 'nav.roles'],
  ['simulador', 'nav.simulator'],
  ['preguntas', 'nav.faq'],
] as const;

const ROLES: { id: string; name: string; role: Role }[] = [
  { id: 'mariana', name: 'Mariana López', role: 'participant' },
  { id: 'diego', name: 'Diego Suárez', role: 'participant' },
  { id: 'andres', name: 'Andrés Molina', role: 'tutor' },
  { id: 'paula', name: 'Paula Gómez', role: 'ld_admin' },
  { id: 'ricardo', name: 'Ricardo Benítez', role: 'sponsor' },
];

const STAGGER = 0.05;
const container = 'mx-auto w-full max-w-[75rem] px-(--space-gutter)';

function Section({ id, children, tone = 'white' }: { id: string; children: ReactNode; tone?: 'surface' | 'white' }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn('scroll-mt-20 py-16 md:py-24', tone === 'white' ? 'bg-surface-container-lowest' : 'bg-surface')}
    >
      <div className={cn(container, 'flex flex-col gap-10 md:gap-12')}>{children}</div>
    </section>
  );
}

/** Centered title with a pill eyebrow (reference: "Our Features", "Why Choose Us"). */
function SectionTitle({ id, eyebrow, title, intro }: { id: string; eyebrow: string; title: string; intro?: string }) {
  return (
    <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
      <p className="rounded-full border border-primary px-3 py-1 text-label-medium text-balance text-primary">{eyebrow}</p>
      <h2 id={`${id}-title`} className="text-headline-small text-balance text-on-surface md:text-display-small">
        {title}
      </h2>
      {intro && <p className="max-w-2xl text-body-large text-balance text-on-surface-variant">{intro}</p>}
    </Reveal>
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

/** Key words in primary with a flat hand-drawn underline (reference: "Real Life"). Decorative line. */
function Underlined({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap text-primary">
      {children}
      <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-2.5 w-full md:-bottom-2 md:h-3">
        <path d="M2 9 C 50 3, 140 2, 198 6" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}

const footerLink = 'w-fit text-body-medium text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline';

export function LandingPage() {
  const { t } = useTranslation();
  const participants = seed.people.filter((p) => p.role === 'participant').length;
  const phaseA = levels.filter((l) => l.phase === 'A');
  const missions = new Set(phaseA.flatMap((l) => l.missionIds)).size;
  const tools = new Set(phaseA.flatMap((l) => l.toolSimIds)).size;
  const figures = [
    [phaseA.length, 'landing.figures.levels'],
    [missions, 'landing.figures.missions'],
    [tools, 'landing.figures.tools'],
    [participants, 'landing.figures.people'],
  ] as const;

  return (
    <div className="bg-surface-container-lowest">
      <a
        href="#main-content"
        className="sr-only rounded-sm bg-surface-container-lowest px-4 py-3 text-label-large text-primary focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:shadow-elevation-1"
      >
        {t('app.skipToContent')}
      </a>

      {/* 1 · Top bar: logo, sections in the center, one filled action */}
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container-lowest">
        <div className={cn(container, 'grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3')}>
          <Link to="/" aria-label={t('landing.homeLabel')} className="rounded-sm">
            <Logo />
          </Link>
          <nav aria-label={t('landing.nav.label')} className="hidden justify-self-center large:block">
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
          <Button asChild size="s" className="col-start-3">
            <a href="#recorridos">{t('landing.chooseJourney')}</a>
          </Button>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* 2 · Hero: text on the left, the app on a real-size phone with feature cards on the right */}
        <section aria-labelledby="hero-title" className="overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
          <div className={cn(container, 'grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8')}>
            <div className="flex min-w-0 flex-col items-start gap-6">
              {/* Announcement badge: the case type as a tag, the product category as text */}
              <Reveal>
                <p className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-1 pr-3 text-label-medium text-on-surface-variant xl:flex-nowrap xl:rounded-full xl:whitespace-nowrap">
                  <span className="rounded-sm bg-primary-container px-2.5 py-1 text-on-primary-container xl:rounded-full">{t('landing.eyebrowTag')}</span>
                  <span className="px-1 py-0.5">{t('landing.eyebrowText')}</span>
                </p>
              </Reveal>
              <Reveal delay={STAGGER}>
                <h1 id="hero-title" className="text-headline-small text-balance text-on-surface md:text-display-small xl:text-display-medium">
                  {t('landing.hero.titleStart')} <Underlined>{t('landing.hero.titleKey')}</Underlined> {t('landing.hero.titleEnd')}
                </h1>
              </Reveal>
              <Reveal delay={STAGGER * 2}>
                <p className="max-w-xl text-body-large text-on-surface-variant">{t('landing.hero.body')}</p>
              </Reveal>
              <Reveal delay={STAGGER * 3} className="w-full sm:w-auto">
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Button asChild size="m">
                    <a href="#recorridos">{t('landing.chooseJourney')}</a>
                  </Button>
                  <Button asChild size="m" variant="outlined" trailingIcon="open_in_new">
                    <External href={CASE_STUDY_URL}>{t('landing.hero.caseStudy')}</External>
                  </Button>
                </div>
              </Reveal>
            </div>
            <HeroPhone />
          </div>
        </section>

        {/* 8 · Figures as the band under the hero (the reference's logo band, without logos) */}
        <section aria-labelledby="cifras-title" className="pb-16 md:pb-24">
          <Reveal className={container}>
            <div className="flex flex-col items-center gap-8 rounded-xl bg-primary px-6 py-10 text-center text-on-primary md:px-10">
              <div className="flex flex-col gap-1">
                <h2 id="cifras-title" className="text-title-large">
                  {t('landing.figures.title')}
                </h2>
                <p className="text-body-medium">{t('landing.figures.intro')}</p>
              </div>
              <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                {figures.map(([value, key]) => (
                  <div key={key} className="flex flex-col-reverse items-center gap-1">
                    <dt className="text-body-medium text-balance">{t(key)}</dt>
                    <dd className="text-display-small tabular-nums">
                      <CountUp value={value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </section>

        {/* 3 · The problem: tinted cards with a scene on top (reference: "Why choose us") */}
        <Section id="problema" tone="surface">
          <SectionTitle id="problema" eyebrow={t('landing.problem.eyebrow')} title={t('landing.problem.title')} />
          <ul className="grid grid-cols-1 gap-(--space-bento-gap) md:grid-cols-3">
            {(
              [
                ['budget', 'bg-primary-container', <SceneBudget key="b" />],
                ['inflation', 'bg-surface-container-lowest border border-outline-variant', <SceneInflation key="i" />],
                ['card', 'bg-secondary-container', <SceneCard key="c" />],
              ] as const
            ).map(([key, tone, scene], index) => (
              <Reveal as="li" key={key} delay={index * STAGGER} className={cn('flex min-w-0 flex-col gap-5 rounded-xl p-3 pb-6', tone)}>
                <div className="flex min-h-36 flex-col justify-center rounded-lg border border-outline-variant bg-surface-container-lowest p-4">{scene}</div>
                <div className="flex flex-col gap-2 px-3 text-center">
                  <h3 className="text-title-medium text-on-surface">{t(`landing.problem.${key}.title`)}</h3>
                  <p className="text-body-medium text-on-surface-variant">{t(`landing.problem.${key}.body`)}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Section>

        {/* 4 · The solution: alternating feature rows with a numbered list */}
        <Section id="solucion">
          <SectionTitle id="solucion" eyebrow={t('landing.solution.eyebrow')} title={t('landing.solution.title')} intro={t('landing.solution.intro')} />
          <ul className="-mb-6 flex flex-col gap-(--space-bento-gap) md:-mb-8">
            <FeatureRow rowKey="route">
              <div className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 sm:flex-row sm:items-end sm:justify-between">
                <PieceLevelMap />
                <div className="flex min-w-0 flex-col gap-2 rounded-lg bg-surface p-3 sm:w-56">
                  <p className="flex items-center gap-1.5 text-label-large text-on-surface">
                    <Icon name="lock" size={18} /> {t('landing.floating.unlockTitle')}
                  </p>
                  <ProgressBar value={66.67} label={t('landing.floating.unlockProgress')} valueText={t('landing.floating.unlockValue')} tone="tertiary" />
                  <p className="text-body-small text-on-surface-variant">
                    {t('landing.floating.unlockProgress')}: {t('landing.floating.unlockValue')}
                  </p>
                </div>
              </div>
            </FeatureRow>
            <FeatureRow rowKey="practice" reverse>
              <div className="grid gap-3 sm:grid-cols-2">
                <PieceSimResult />
                <PieceGoal />
              </div>
            </FeatureRow>
            <FeatureRow rowKey="tracking">
              <div className="grid gap-3 sm:grid-cols-2">
                <PieceKpi />
                <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-info-container text-on-info-container">
                    <Icon name="shield" size={20} />
                  </span>
                  <p className="text-label-medium text-on-surface-variant">{t('landing.solution.rows.tracking.privacyLabel')}</p>
                  <p className="text-body-medium text-on-surface">{t('landing.solution.rows.tracking.privacyBody')}</p>
                </div>
              </div>
            </FeatureRow>
          </ul>

          {/* 5 · Learn anywhere: the same guide on a computer and on a real-size phone */}
          <Reveal>
            <section id="cualquier-lugar" aria-labelledby="cualquier-lugar-title" className="grid scroll-mt-20 grid-cols-[minmax(0,1fr)] items-center gap-10 rounded-xl bg-surface-container p-5 md:p-10 lg:grid-cols-2 lg:gap-14">
              <div className="flex min-w-0 flex-col items-start gap-4">
                <p className="rounded-full border border-primary px-3 py-1 text-label-medium text-primary">{t('landing.anywhere.eyebrow')}</p>
                <h2 id="cualquier-lugar-title" className="text-title-large text-balance text-on-surface md:text-headline-small">
                  {t('landing.anywhere.title')}
                </h2>
                <p className="text-body-large text-on-surface-variant">{t('landing.anywhere.intro')}</p>
                <ul className="flex flex-col gap-2.5 pt-2">
                  {(t('landing.anywhere.points', { returnObjects: true }) as string[]).map((point) => (
                    <li key={point} className="flex items-start gap-3 text-body-medium text-on-surface">
                      <Icon name="check_circle" size={20} className="shrink-0 text-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <figure className="mx-auto flex w-80 max-w-full flex-col items-center gap-3">
                <PhoneFrame label={t('landing.anywhere.phoneLabel')}>
                  <StatusBar />
                  <AppTopBar section={t('wallet.nav.learn')} />
                  <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3.5 py-3">
                    <GuidePreview />
                    <WorkedExample />
                    <span className="mt-auto rounded-sm bg-primary py-2.5 text-center text-label-large text-on-primary">{t('landing.anywhere.answer')}</span>
                  </div>
                  <BottomNav active="learn" />
                </PhoneFrame>
                <figcaption className="text-center text-body-small text-on-surface-variant">{t('landing.anywhere.mobile')}</figcaption>
              </figure>
            </section>
          </Reveal>
        </Section>

        {/* 6 · One journey per role */}
        <Section id="recorridos" tone="surface">
          <SectionTitle id="recorridos" eyebrow={t('landing.roles.eyebrow')} title={t('landing.roles.title')} intro={t('landing.roles.intro')} />
          {/* No holes (2.4): the two participants share the first row and the other three roles the
              second on desktop; on tablets the last card takes the full row. */}
          <ul className="grid grid-cols-1 gap-(--space-bento-gap) md:grid-cols-2 large:grid-cols-6">
            {ROLES.map((r, index) => (
              <Reveal
                as="li"
                key={r.id}
                delay={index * STAGGER}
                className={cn(
                  'flex min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding) pt-0',
                  index < 2 ? 'large:col-span-3' : 'large:col-span-2',
                  index === ROLES.length - 1 && 'md:col-span-2 large:col-span-2',
                )}
              >
                {/* Role color identifies the person (2.1.1), as a flat bar on top */}
                <span aria-hidden className={cn('-mx-(--space-card-padding) mb-2 h-1.5', ROLE_ACCENT[r.role].bar)} />
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
                  <Link to={`/login?demo=${r.id}`}>{t('landing.roles.cta', { name: r.name.split(' ')[0] })}</Link>
                </Button>
              </Reveal>
            ))}
          </ul>
        </Section>

        {/* 7 · Try a simulator without signing in */}
        <Section id="simulador">
          <SectionTitle id="simulador" eyebrow={t('landing.simulator.eyebrow')} title={t('landing.simulator.title')} intro={t('landing.simulator.intro')} />
          <Reveal>
            <InflationSimulator headingLevel="h3" idPrefix="g0-sim3" />
          </Reveal>
        </Section>

        {/* 9 · Three steps and FAQ */}
        <Section id="preguntas" tone="surface">
          <SectionTitle id="preguntas" eyebrow={t('landing.steps.eyebrow')} title={t('landing.steps.title')} />
          <ol className="grid grid-cols-1 gap-(--space-bento-gap) md:grid-cols-3">
            {[1, 2, 3].map((n, index) => (
              <Reveal
                as="li"
                key={n}
                delay={index * STAGGER}
                className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-label-large text-on-primary">{n}</span>
                <h3 className="text-title-medium text-on-surface">{t(`landing.steps.s${n}.title`)}</h3>
                <p className="text-body-medium text-on-surface-variant">{t(`landing.steps.s${n}.body`)}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            <h3 className="text-center text-title-large text-on-surface">{t('landing.faq.title')}</h3>
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
          </Reveal>
        </Section>

        {/* 10 · Final band, same family as the figures band */}
        <section aria-labelledby="final-title" className="py-16 md:py-24">
          <Reveal className={container}>
            <div className="flex flex-col items-start gap-6 rounded-xl bg-primary px-6 py-10 text-on-primary md:flex-row md:items-center md:justify-between md:px-10">
              <h2 id="final-title" className="max-w-xl text-title-large text-balance md:text-headline-small">
                {t('landing.final.title')}
              </h2>
              <Button asChild size="m" variant="tonal">
                <a href="#recorridos">{t('landing.chooseJourney')}</a>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-outline-variant">
        <div className={cn(container, 'grid grid-cols-1 gap-8 py-12 md:grid-cols-2 large:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]')}>
          <div className="flex max-w-sm flex-col gap-3">
            <Logo />
            <p className="text-body-medium text-on-surface-variant">{t('landing.footer.tagline')}</p>
          </div>
          <nav aria-labelledby="footer-explore" className="flex flex-col gap-2">
            <h2 id="footer-explore" className="text-title-small text-on-surface">{t('landing.footer.explore')}</h2>
            {NAV.map(([id, key]) => (
              <a key={id} href={`#${id}`} className={footerLink}>
                {t(`landing.${key}`)}
              </a>
            ))}
          </nav>
          <nav aria-labelledby="footer-project" className="flex flex-col gap-2">
            <h2 id="footer-project" className="text-title-small text-on-surface">{t('landing.footer.project')}</h2>
            <External href={CASE_STUDY_URL} className={footerLink}>
              {t('landing.footer.caseStudy')}
            </External>
            <External href={DOCS_URL} className={footerLink}>
              {t('landing.footer.docs')}
            </External>
          </nav>
          <nav aria-labelledby="footer-demo" className="flex flex-col gap-2">
            <h2 id="footer-demo" className="text-title-small text-on-surface">{t('landing.footer.demo')}</h2>
            <Link to="/login?demo=mariana" className={footerLink}>
              {t('landing.roles.cta', { name: 'Mariana' })}
            </Link>
            <Link to="/login?demo=diego" className={footerLink}>
              {t('landing.roles.cta', { name: 'Diego' })}
            </Link>
            <ResetDemoButton />
          </nav>
        </div>
        <div className="border-t border-outline-variant">
          <div className={cn(container, 'flex flex-col gap-3 py-6 text-body-small text-on-surface-variant md:flex-row md:items-center md:justify-between')}>
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
    </div>
  );
}

/**
 * Hero visual (Finotive reference): the app on a real-size phone, with feature cards that overlap
 * its edges from 1280 px, and a segmented button to see three real screens. The cards enter after
 * the phone, once; nothing floats in a loop (2.6).
 */
function HeroPhone() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<PhoneScreen>('home');
  return (
    <div className="flex min-w-0 flex-col items-center gap-6">
      <div className="relative">
        {/* Flat tinted shape behind the phone (instead of the reference's gradient glow) */}
        <span aria-hidden className="absolute inset-x-[-15%] top-[12%] bottom-[8%] rounded-2xl bg-primary-container" />
        <Reveal delay={0.1} className="relative">
          <AppPhone screen={screen} />
        </Reveal>
        <Reveal delay={0.3} className="absolute top-28 -left-36 hidden w-44 xl:block">
          <div aria-hidden>
            <PieceSimResult />
          </div>
        </Reveal>
        <Reveal delay={0.4} className="absolute -right-40 bottom-36 hidden w-48 xl:block">
          <div aria-hidden className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <p className="text-label-medium text-on-surface-variant">{t('landing.floating.unlockLabel')}</p>
            <p className="flex items-center gap-1.5 text-title-small text-on-surface">
              <Icon name="lock" size={18} /> {t('landing.floating.unlockTitle')}
            </p>
            <ProgressBar value={66.67} label={t('landing.floating.unlockProgress')} valueText={t('landing.floating.unlockValue')} tone="tertiary" />
            <p className="text-body-small text-on-surface-variant">
              {t('landing.floating.unlockProgress')}: {t('landing.floating.unlockValue')}
            </p>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.2}>
        <SegmentedButton
          label={t('landing.phone.switcher')}
          value={screen}
          onValueChange={setScreen}
          options={(['home', 'levels', 'tool'] as const).map((value) => ({ value, label: t(`landing.phone.screens.${value}`) }))}
        />
      </Reveal>
    </div>
  );
}

/** One row of the solution: a product piece and a title with its key word, text and numbered list. */
function FeatureRow({ rowKey, reverse = false, children }: { rowKey: 'route' | 'practice' | 'tracking'; reverse?: boolean; children: ReactNode }) {
  const { t } = useTranslation();
  const base = `landing.solution.rows.${rowKey}`;
  const items = t(`${base}.items`, { returnObjects: true }) as string[];
  return (
    <Reveal as="li" className="grid items-center gap-10 rounded-xl bg-surface-container p-5 md:p-10 lg:grid-cols-2 lg:gap-14">
      <div className={cn('relative min-w-0 pt-6', reverse && 'lg:order-2')} aria-hidden>
        {/* Floating tag on the visual (reference: the blue amount tag), flat */}
        <span className="absolute top-0 left-4 z-10 rounded-md bg-primary px-3 py-1.5 text-label-large text-on-primary">{t(`${base}.chip`)}</span>
        {children}
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <h3 className="text-title-large text-balance text-on-surface md:text-headline-small">
          {t(`${base}.titleStart`)} <span className="text-primary">{t(`${base}.titleKey`)}</span>
        </h3>
        <p className="text-body-large text-on-surface-variant">{t(`${base}.body`)}</p>
        <ol className="flex flex-col gap-2.5">
          {items.map((item, i) => (
            <li key={item} className="flex items-start gap-3 text-body-medium text-on-surface">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-medium text-on-primary-container tabular-nums">
                {i + 1}
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}

/** The guide's worked example on the phone, computed with the same formula as SIM-6 (F-10). */
function WorkedExample() {
  const { t } = useTranslation();
  const pv = installmentsPresentValue({ installment: '10000', count: 12, monthlyInflation: '0.03' });
  return (
    <div className="flex flex-col gap-1 rounded-md bg-info-container p-3 text-on-info-container">
      <p className="flex items-center gap-1.5 text-label-medium">
        <Icon name="lightbulb" size={16} /> {t('landing.anywhere.exampleTitle')}
      </p>
      <p className="text-body-small">
        {t('landing.anywhere.example', {
          installment: formatMoney('10000', { decimals: 0 }),
          pv: formatMoney(pv, { decimals: 0 }),
          cash: formatMoney('102000', { decimals: 0 }),
        })}
      </p>
    </div>
  );
}

/** The guide on Diego's phone (F0, section 5): progress, kicker, question and two options. */
function GuidePreview() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2.5">
      <div className="h-1.5 w-full rounded-full bg-surface-container-high">
        <div className="h-1.5 w-2/5 rounded-full bg-primary" />
      </div>
      <p className="text-label-medium text-primary">{t('landing.anywhere.guideKicker')}</p>
      <p className="text-title-medium text-on-surface">{t('landing.anywhere.guideTitle')}</p>
      <p className="text-body-small text-on-surface-variant">{t('landing.anywhere.guideBody')}</p>
      <div className="grid grid-cols-2 gap-2">
        <span className="rounded-md border border-primary bg-primary-container px-3 py-2 text-label-large text-on-primary-container">
          {t('landing.anywhere.optionA')}
        </span>
        <span className="rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-large text-on-surface">
          {t('landing.anywhere.optionB')}
        </span>
      </div>
    </div>
  );
}
