import { motion } from 'motion/react';
import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/ui/IconButton';
import { useShouldReduceMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface Slide {
  key: string;
  /** Short name of the tab ("Ruta"). */
  tab: string;
  content: ReactNode;
}

/** Time each slide stays before the next one, while the carousel rotates on its own. */
export const SLIDE_MS = 7000;

/**
 * Landing "La solución" (D-281): an auto-rotating carousel with tabs, after the WAI-ARIA APG pattern.
 * One slide at a time, the same height for all (no jump), and the tabs to choose one. It advances on its
 * own every 7 s while it is in view, pauses while the pointer or the focus is on it, stops for good when
 * the person picks a tab or, on phones and tablets, presses pause (WCAG 2.2.2), and goes round only once: the design system has
 * no looping animations (2.6). With reduced motion it never rotates on its own.
 */
export function SolutionCarousel({ label, slides }: { label: string; slides: Slide[] }) {
  const { t } = useTranslation();
  const reduce = useShouldReduceMotion();
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [rotating, setRotating] = useState(!reduce);
  const [inView, setInView] = useState(false);
  const [hold, setHold] = useState(false);
  const running = rotating && inView && !hold && !reduce;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      if (index === slides.length - 1) {
        // One full round, then it stops at the first slide (no loop, 2.6)
        setIndex(0);
        setRotating(false);
      } else setIndex(index + 1);
    }, SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [running, index, slides.length]);

  const choose = (i: number, focus = false) => {
    setRotating(false);
    setIndex(i);
    if (focus) tabs.current[i]?.focus();
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = slides.length - 1;
    const next = e.key === 'ArrowRight' ? (index === last ? 0 : index + 1) : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    choose(next, true);
  };

  return (
    <section
      ref={ref}
      aria-roledescription={t('landing.solution.carousel.role')}
      aria-label={label}
      className="flex flex-col gap-4"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false);
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Rotation control (WCAG 2.2.2): on desktop the pointer or the focus over the carousel pauses it,
            so the button only shows, small, on phones and tablets, where there is no hover (D-281) */}
        {!reduce && (
          <IconButton
            icon={rotating ? 'pause' : 'play_arrow'}
            label={rotating ? t('landing.solution.carousel.pause') : t('landing.solution.carousel.play')}
            variant="standard"
            size="xs"
            className="large:hidden"
            onClick={() => setRotating(!rotating)}
          />
        )}
        <div role="tablist" aria-label={t('landing.solution.carousel.tabs')} className="flex flex-wrap justify-center gap-2">
          {slides.map((s, i) => {
            const selected = i === index;
            return (
              <button
                key={s.key}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                id={`${id}-tab-${s.key}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${id}-panel-${s.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(i)}
                onKeyDown={onKey}
                className={cn(
                  'relative min-h-10 overflow-hidden rounded-full border px-4 py-2 text-label-large transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  selected ? 'border-primary bg-primary-container text-on-primary-container' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container',
                )}
              >
                {s.tab}
                {/* How long until the next slide, only while it rotates */}
                {selected && running && (
                  <motion.span
                    key={`${index}-${running}`}
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* All slides share one cell, so the tallest sets the height and nothing jumps */}
      <div className="grid" aria-live={running ? 'off' : 'polite'}>
        {slides.map((s, i) => {
          const selected = i === index;
          return (
            <motion.div
              key={s.key}
              id={`${id}-panel-${s.key}`}
              role="tabpanel"
              aria-roledescription={t('landing.solution.carousel.slide')}
              aria-labelledby={`${id}-tab-${s.key}`}
              className={cn('col-start-1 row-start-1 min-w-0', !selected && 'invisible')}
              initial={false}
              animate={{ opacity: selected ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.3 }}
            >
              {s.content}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
