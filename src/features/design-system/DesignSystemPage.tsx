import { Dialog as DialogPrimitive } from 'radix-ui';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { DESIGN_SYSTEM_MD_URL, DOCS_URL, GITHUB_PROFILE_URL, LINKEDIN_URL, PORTFOLIO_URL, REPO_URL } from '@/app/links';
import { BackToTop } from '@/components/layout/BackToTop';
import { InPageLink, scrollToTarget } from '@/components/layout/InPageLink';
import { Logo } from '@/components/layout/Logo';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';
import { ColorSection, IconsSection, MotionSection, SpaceSection, TYPE_ROLES, TypeSection } from './DsFoundations';
import { TokenTiersFigure } from './DsFigures';
import { ComponentsSection, FuerteSection, MoneySection, SecuritySection } from './DsSections';

type SectionId = 'principles' | 'tokens' | 'color' | 'type' | 'space' | 'icons' | 'motion' | 'components' | 'fuerte' | 'patterns' | 'money' | 'security' | 'a11y' | 'voice' | 'credits';

const GROUPS: { key: 'foundations' | 'components' | 'patterns' | 'guidelines'; ids: SectionId[] }[] = [
  { key: 'foundations', ids: ['principles', 'tokens', 'color', 'type', 'space', 'icons', 'motion'] },
  { key: 'components', ids: ['components', 'fuerte'] },
  { key: 'patterns', ids: ['patterns', 'money', 'security'] },
  { key: 'guidelines', ids: ['a11y', 'voice', 'credits'] },
];
const ORDER = GROUPS.flatMap((g) => g.ids);
const card = 'flex min-w-0 flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-(--space-card-padding)';

function DsSection({ id, children }: { id: SectionId; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <section id={`ds-${id}`} aria-labelledby={`ds-${id}-title`} className="flex scroll-mt-40 flex-col gap-6 focus:outline-none large:scroll-mt-28">
      <div className="flex flex-col gap-2">
        <p className="text-label-large text-primary">{t(`designSystem.sections.${id}.eyebrow`)}</p>
        <h2 id={`ds-${id}-title`} className="text-headline-small text-pretty text-on-surface">
          {t(`designSystem.sections.${id}.title`)}
        </h2>
        <p className="max-w-[72ch] text-body-large text-pretty text-on-surface-variant">{t(`designSystem.sections.${id}.intro`)}</p>
      </div>
      {children}
    </section>
  );
}

/** The last section whose top has passed under the sticky header. */
function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>('principles');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: SectionId = 'principles';
      const line = (document.querySelector('header')?.getBoundingClientRect().bottom ?? 80) + 160;
      for (const id of ORDER) {
        const el = document.getElementById(`ds-${id}`);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return active;
}

/** Counts the system tokens declared on :root, so the hero number is never written by hand. */
function countTokens(): number | null {
  const names = new Set<string>();
  const prefixes = ['--md-', '--role-', '--chart-', '--space-', '--elevation-', '--fuerte-'];
  for (const sheet of [...document.styleSheets]) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    const walk = (list: CSSRuleList) => {
      for (const rule of [...list]) {
        if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
          for (const prop of [...rule.style]) if (prefixes.some((p) => prop.startsWith(p))) names.add(prop);
        } else if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules);
      }
    };
    walk(rules);
  }
  return names.size || null;
}

function SectionIndex({ active, onNavigate }: { active: SectionId; onNavigate?: (id: SectionId) => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-5">
      {GROUPS.map((g) => (
        <div key={g.key} className="flex flex-col gap-1">
          <p className="px-3 text-label-medium text-on-surface-variant">{t(`designSystem.nav.${g.key}`)}</p>
          <ul className="flex flex-col">
            {g.ids.map((id) => (
              <li key={id}>
                <InPageLink
                  to={`ds-${id}`}
                  onClick={
                    onNavigate
                      ? (e) => {
                          e.preventDefault();
                          onNavigate(id);
                        }
                      : undefined
                  }
                  aria-current={active === id ? 'true' : undefined}
                  className={cn(
                    'flex min-h-12 items-center rounded-full px-3 text-label-large transition-colors focus-visible:outline-2 focus-visible:outline-primary large:min-h-9',
                    active === id ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-container',
                  )}
                >
                  {t(`designSystem.sections.${id}.eyebrow`)}
                </InPageLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * Below 1200 px: a bar in the sticky header that says where you are and opens the whole index in
 * a sheet from the left. Choosing a section closes the sheet, scrolls there and moves the focus.
 */
function SectionsSheet({ active }: { active: SectionId }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const target = useRef<SectionId | null>(null);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="flex h-12 w-full min-w-0 items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-left transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Icon name="toc" size={20} className="shrink-0 text-primary" />
          <span className="shrink-0 text-label-large text-on-surface">{t('designSystem.nav.menu')}</span>
          <span aria-hidden className="h-4 w-px shrink-0 bg-outline-variant" />
          <span className="min-w-0 flex-1 truncate text-body-medium text-on-surface-variant">
            <span className="sr-only">{t('designSystem.nav.current')} </span>
            {t(`designSystem.sections.${active}.eyebrow`)}
          </span>
          <Icon name="keyboard_arrow_down" size={20} className="shrink-0 text-on-surface-variant" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-scrim/32 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(event) => {
            const current = (event.currentTarget as HTMLElement | null)?.querySelector<HTMLElement>('[aria-current="true"]');
            if (current) {
              event.preventDefault();
              current.focus();
            }
          }}
          onCloseAutoFocus={(event) => {
            if (!target.current) return;
            event.preventDefault();
            scrollToTarget(`ds-${target.current}`);
            target.current = null;
          }}
          className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100%-3rem))] flex-col gap-4 bg-surface-container-lowest px-3 py-4 shadow-elevation-2 duration-200 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left"
        >
          <div className="flex items-center justify-between gap-2 pl-3">
            <DialogPrimitive.Title className="text-title-medium text-on-surface">{t('designSystem.nav.onThisPage')}</DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <IconButton icon="close" label={t('designSystem.nav.close')} />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="sr-only">{t('designSystem.nav.sheetDescription')}</DialogPrimitive.Description>
          <nav aria-label={t('designSystem.nav.onThisPage')} className="min-h-0 flex-1 overflow-y-auto">
            <SectionIndex
              active={active}
              onNavigate={(id) => {
                target.current = id;
                setOpen(false);
              }}
            />
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Highlights one phrase of a title in primary. */
function highlight(text: string, part: string) {
  const i = text.indexOf(part);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-primary">{part}</span>
      {text.slice(i + part.length)}
    </>
  );
}

/**
 * G8, the public site of Alcancía's design system (CLAUDE.md 2.8, D-199), at /#/design-system:
 * foundations read live from the tokens, real components, patterns with their decision numbers,
 * how money is shown, security and privacy, accessibility, voice and credits. Same architecture
 * as Rumbo's site, with Alcancía's identity. docs/design-system.md is its Markdown version.
 */
export function DesignSystemPage() {
  const { t } = useTranslation();
  const active = useActiveSection();
  const [tokenCount] = useState(countTokens);
  const principles = t('designSystem.principles', { returnObjects: true }) as { title: string; body: string }[];
  const patterns = t('designSystem.patterns', { returnObjects: true }) as string[][];
  const a11y = t('designSystem.a11y', { returnObjects: true }) as string[][];
  const voice = t('designSystem.voice.principles', { returnObjects: true }) as string[][];
  const vocab = t('designSystem.voice.vocab', { returnObjects: true }) as string[][];
  const credits = t('designSystem.credits', { returnObjects: true }) as string[][];

  useEffect(() => {
    const previous = document.title;
    document.title = `${t('designSystem.docTitle')} · Alcancía`;
    return () => {
      document.title = previous;
    };
  }, [t]);

  const stats: [string, string][] = [
    [tokenCount ? String(tokenCount) : '·', t('designSystem.hero.stats.tokens')],
    ['7', t('designSystem.hero.stats.roles')],
    [String(TYPE_ROLES.length), t('designSystem.hero.stats.type')],
    [String(patterns.length), t('designSystem.hero.stats.patterns')],
  ];
  const container = 'mx-auto w-full max-w-[90rem]';
  const footerLink = 'inline-flex min-h-12 items-center gap-1 text-label-large text-primary underline-offset-4 hover:underline sm:min-h-10';

  return (
    <div className="min-h-dvh bg-surface">
      <InPageLink
        to="ds-main"
        className="sr-only rounded-sm bg-surface-container-lowest px-4 py-3 text-label-large text-primary focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:shadow-elevation-1"
      >
        {t('designSystem.skip')}
      </InPageLink>

      <header className="sticky top-0 z-40 bg-surface px-(--space-gutter) pt-3 pb-2 large:pb-3">
        <div className={cn(container, 'flex h-16 items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest px-4')}>
          <Link to="/" className="flex min-h-12 min-w-0 items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-primary">
            <Logo />
            <span aria-hidden className="hidden h-5 w-px bg-outline-variant sm:block" />
            <span className="hidden truncate text-label-large text-on-surface-variant sm:block">{t('designSystem.title')}</span>
          </Link>
          <nav aria-label={t('designSystem.nav.label')} className="hidden items-center gap-6 large:flex">
            {GROUPS.map((g) => (
              <InPageLink key={g.key} to={`ds-${g.ids[0]}`} className="rounded-xs text-label-large text-primary hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                {t(`designSystem.nav.${g.key}`)}
              </InPageLink>
            ))}
          </nav>
          <Button asChild trailingIcon="arrow_forward" className="shrink-0">
            <Link to="/">{t('designSystem.nav.demo')}</Link>
          </Button>
        </div>
        <div className={cn(container, 'pt-2 large:hidden')}>
          <SectionsSheet active={active} />
        </div>
      </header>

      <main id="ds-main" tabIndex={-1} className="px-(--space-gutter) pb-16 focus:outline-none">
        <div className={container}>
          <section className="flex flex-col items-center gap-6 py-14 text-center large:py-20">
            <p className="text-label-large text-balance text-primary">{t('designSystem.hero.eyebrow')}</p>
            <h1 className="max-w-4xl text-headline-medium text-balance text-on-surface sm:text-display-small">{highlight(t('designSystem.hero.title'), t('designSystem.hero.highlight'))}</h1>
            <p className="max-w-[72ch] text-body-large text-pretty text-on-surface-variant">{t('designSystem.hero.intro')}</p>
            <ul data-stagger className="grid w-full max-w-3xl grid-cols-2 gap-x-6 gap-y-8 pt-4 sm:grid-cols-4">
              {stats.map(([n, label], i) => (
                <li key={label} className="flex flex-col items-center gap-1">
                  <span className={cn('text-display-small tabular-nums', i % 2 ? 'text-tertiary' : 'text-primary')}>{n}</span>
                  <span className="text-body-medium text-on-surface-variant">{label}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="text" trailingIcon="open_in_new">
              <a href={DESIGN_SYSTEM_MD_URL} target="_blank" rel="noopener noreferrer">
                {t('designSystem.hero.md')}
                <span className="sr-only"> {t('designSystem.newTab')}</span>
              </a>
            </Button>
          </section>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-10 large:grid-cols-[14rem_minmax(0,1fr)] large:gap-12">
            <aside className="hidden large:sticky large:top-28 large:block large:max-h-[calc(100dvh-8rem)] large:self-start large:overflow-y-auto">
              <nav aria-label={t('designSystem.nav.onThisPage')}>
                <SectionIndex active={active} />
              </nav>
            </aside>

            <div className="flex min-w-0 flex-col gap-20">
              <DsSection id="principles">
                <ol className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) sm:grid-cols-2 xl:grid-cols-3">
                  {principles.map((p, i) => (
                    <li key={p.title} className={cn(card, 'gap-3')}>
                      <span className="text-display-small text-primary tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      <h3 className="text-title-medium text-on-surface">{p.title}</h3>
                      <p className="text-body-medium text-on-surface-variant">{p.body}</p>
                    </li>
                  ))}
                </ol>
              </DsSection>
              <DsSection id="tokens">
                <TokenTiersFigure />
              </DsSection>
              <DsSection id="color">
                <ColorSection />
              </DsSection>
              <DsSection id="type">
                <TypeSection />
              </DsSection>
              <DsSection id="space">
                <SpaceSection />
              </DsSection>
              <DsSection id="icons">
                <IconsSection />
              </DsSection>
              <DsSection id="motion">
                <MotionSection />
              </DsSection>
              <DsSection id="components">
                <ComponentsSection />
              </DsSection>
              <DsSection id="fuerte">
                <FuerteSection />
              </DsSection>
              <DsSection id="patterns">
                <ul className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) md:grid-cols-2 xl:grid-cols-3">
                  {patterns.map(([ref, title, body]) => (
                    <li key={title} className={card}>
                      <span className="w-fit rounded-full bg-tertiary-container px-2.5 py-0.5 text-label-medium text-on-tertiary-container tabular-nums">{ref}</span>
                      <h3 className="text-title-medium text-on-surface">{title}</h3>
                      <p className="text-body-medium text-on-surface-variant">{body}</p>
                    </li>
                  ))}
                </ul>
              </DsSection>
              <DsSection id="money">
                <MoneySection />
              </DsSection>
              <DsSection id="security">
                <SecuritySection />
              </DsSection>
              <DsSection id="a11y">
                <ul className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) sm:grid-cols-2 xl:grid-cols-3">
                  {a11y.map(([title, body]) => (
                    <li key={title} className={cn(card, 'flex-row items-start gap-3')}>
                      <Icon name="check_circle" size={24} className="shrink-0 text-success" />
                      <span className="flex flex-col gap-1">
                        <h3 className="text-title-medium text-on-surface">{title}</h3>
                        <span className="text-body-medium text-on-surface-variant">{body}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </DsSection>
              <DsSection id="voice">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) lg:grid-cols-2">
                  <ul className="flex flex-col gap-3">
                    {voice.map(([title, body]) => (
                      <li key={title} className={card}>
                        <h3 className="text-title-medium text-on-surface">{title}</h3>
                        <p className="text-body-medium text-on-surface-variant">{body}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="self-start overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                    <table className="w-full text-left text-body-medium">
                      <thead className="bg-surface-container text-title-small text-on-surface-variant">
                        <tr>
                          <th scope="col" className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="check_circle" size={16} className="text-success" />
                              {t('designSystem.voice.use')}
                            </span>
                          </th>
                          <th scope="col" className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="block" size={16} className="text-error" />
                              {t('designSystem.voice.avoid')}
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {vocab.map(([use, avoid]) => (
                          <tr key={use} className="border-t border-outline-variant">
                            <td className="px-4 py-3 text-on-surface">{use}</td>
                            <td className="px-4 py-3 text-on-surface-variant">{avoid}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </DsSection>
              <DsSection id="credits">
                <ul className="grid grid-cols-[minmax(0,1fr)] gap-(--space-bento-gap) md:grid-cols-2 xl:grid-cols-3">
                  {credits.map(([title, body], i) => (
                    <li key={title} className={card}>
                      <h3 className="text-title-medium text-on-surface">{title}</h3>
                      <p className="text-body-medium text-on-surface-variant">{body}</p>
                      {/* Attribution required by the free license of the photos (D-71) */}
                      {i === 2 && (
                        <a href="https://www.magnific.com/" target="_blank" rel="noopener noreferrer" className="w-fit text-label-large text-primary underline underline-offset-2">
                          {t('designSystem.magnific')}
                          <span className="sr-only"> {t('designSystem.newTab')}</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </DsSection>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-outline-variant bg-surface-container-lowest px-(--space-gutter) py-8">
        <div className={cn(container, 'flex flex-col gap-5')}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-body-small text-on-surface-variant">{t('landing.footer.credit')} © 2026</p>
            <ul className="-ml-3 flex items-center gap-1 md:-mr-3 md:ml-0" aria-label={t('landing.footer.profiles')}>
              {(
                [
                  [LINKEDIN_URL, t('landing.footer.linkedin'), <BrandIcon key="l" name="linkedin" />],
                  [PORTFOLIO_URL, t('landing.footer.portfolio'), <Icon key="p" name="palette" size={20} />],
                  [GITHUB_PROFILE_URL, t('landing.footer.github'), <BrandIcon key="g" name="github" />],
                ] as const
              ).map(([href, label, icon]) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} ${t('designSystem.newTab')}`}
                    className="flex size-12 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface md:size-10"
                  >
                    {icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 border-t border-outline-variant pt-4">
            <li>
              <Link to="/" className={footerLink}>
                {t('designSystem.footer.demo')}
              </Link>
            </li>
            {(
              [
                [DESIGN_SYSTEM_MD_URL, t('designSystem.footer.md')],
                [DOCS_URL, t('designSystem.footer.docs')],
                [REPO_URL, t('designSystem.footer.repo')],
              ] as const
            ).map(([href, label]) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer" className={footerLink}>
                  {label}
                  <span className="sr-only"> {t('designSystem.newTab')}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
      <BackToTop />
    </div>
  );
}
