import { Popover as PopoverPrimitive } from 'radix-ui';
import { type PointerEvent as ReactPointerEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';
import { Fuerte, type FuerteState } from './Fuerte';
import { FuerteBadge, FuerteSpeech, fuerteMood, NoticeRowContent, noticeRowClass, UpToDate, useNoticeText } from './FuerteParts';
import type { Notice } from './notices';

/**
 * Fuerte as a floating button (D-160, Lourdes's request): he waits at one side of the screen and
 * shows a dot when he has something to say. The panel holds his message (two sentences at most,
 * 5.0.1), "¿Por qué importa?" and an action. The drawing is decorative; the button is named by its
 * text and the message is read as text.
 *
 * He can be dragged anywhere (D-164): on release he snaps to the nearest side and stays between the
 * top bar and the bottom navigation, so he never covers them. Dragging has a one-tap alternative in
 * the panel ("Mover al otro lado", WCAG 2.5.7), and the place is remembered in this browser.
 */
const SIZE = 80;
const DRAG_THRESHOLD = 6;
const POS_KEY = 'alcancia-ui:fuerte-position';

type Side = 'left' | 'right';
interface Place {
  side: Side;
  /** Distance from the top of the window, in px; null = the default corner. */
  top: number | null;
}

function readPlace(): Place {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw) {
      const value = JSON.parse(raw) as Partial<Place>;
      if (value.side === 'left' || value.side === 'right') return { side: value.side, top: typeof value.top === 'number' ? value.top : null };
    }
  } catch {
    // The default place is fine.
  }
  return { side: 'right', top: null };
}

function savePlace(place: Place) {
  try {
    localStorage.setItem(POS_KEY, JSON.stringify(place));
  } catch {
    // The place only lasts for this visit.
  }
}

/** The free area: below the top bar, above the bottom navigation and right of the side menu (when shown). */
function verticalBounds() {
  const header = document.querySelector('[data-wallet-header]');
  const bottomNav = document.querySelector('[data-wallet-bottom-nav]');
  const minTop = (header ? header.getBoundingClientRect().bottom : 0) + 8;
  // Fixed elements have no offsetParent: a hidden bar (display: none) has no boxes.
  const navVisible = bottomNav instanceof HTMLElement && bottomNav.getClientRects().length > 0;
  const limit = navVisible ? bottomNav.getBoundingClientRect().top : window.innerHeight;
  const sideNav = document.querySelector('[data-wallet-side-nav]');
  const minLeft = sideNav instanceof HTMLElement && sideNav.getClientRects().length > 0 ? sideNav.getBoundingClientRect().right : 0;
  return { minTop, maxTop: Math.max(minTop, limit - SIZE - 8), minLeft };
}

const PEEK_KEY = 'alcancia-ui:fuerte-peeked';
const PEEK_MS = 7000;

function peeked(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(PEEK_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}
function markPeeked(id: string) {
  try {
    sessionStorage.setItem(PEEK_KEY, JSON.stringify([...peeked(), id]));
  } catch {
    // Only for this view.
  }
}

const NOTICES_SHOWN = 3;
const HINT_KEY = 'alcancia-ui:fuerte-drag-hint-seen';
function readHintSeen(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === '1';
  } catch {
    return false;
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const sideMargin = () => (window.innerWidth >= 1200 ? 24 : 12);

export function FuerteFab({
  state = 'neutral',
  lights,
  message,
  why,
  notify = true,
  notices = [],
  badge = [],
  peek = false,
  children,
}: {
  state?: FuerteState;
  lights: number;
  message: string;
  why?: string;
  /** "Solo lo importante" (5.0.1): no dot for new messages. */
  notify?: boolean;
  /** What Fuerte tells when opened (D-290): alerts, pending tasks, investments, goals and progress. */
  notices?: Notice[];
  /** The notices that count in the badge, by presence (alerts only with "Solo lo importante"). */
  badge?: Notice[];
  /** "Conversador": the first new notice of the visit shows for a moment in a bubble beside him. */
  peek?: boolean;
  /** Optional action under the message (for example, the active mission). */
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const noticeText = useNoticeText();
  const [open, setOpen] = useState(false);
  // A new message or notice shows the badge again until the panel is opened.
  const signature = [message, ...badge.map((n) => n.id)].join('|');
  const [readSignature, setReadSignature] = useState<string | null>(null);
  const unread = readSignature !== signature && (badge.length > 0 || notify);
  const count = badge.length;
  const hasAlert = notices.some((n) => n.kind === 'alert');
  const hasPending = notices.some((n) => n.kind === 'pending');
  // His face follows what he has to tell (D-291)
  const mood = fuerteMood(state, notices);
  const upToDate = !hasAlert && !hasPending;
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? notices : notices.slice(0, NOTICES_SHOWN);
  // The drag hint is read once: closing it hides it for good in this browser (D-291)
  const [hintSeen, setHintSeen] = useState(readHintSeen);
  const [whyOpen, setWhyOpen] = useState(false);

  // The bubble (5.0.1: "sus mensajes salen como burbuja"): once per notice and per visit, never twice.
  const [bubble, setBubble] = useState<Notice | undefined>();
  // The notices are recomputed on every render: the effect follows the id, and reads the latest notice
  const top0 = badge[0];
  const latestTop = useRef(top0);
  useEffect(() => {
    latestTop.current = top0;
  });
  const topId = top0?.id;
  useEffect(() => {
    if (!peek || !topId || peeked().includes(topId)) return;
    const show = window.setTimeout(() => {
      markPeeked(topId);
      setBubble(latestTop.current);
    }, 900);
    const hide = window.setTimeout(() => setBubble(undefined), 900 + PEEK_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [peek, topId]);

  const [place, setPlace] = useState<Place>(readPlace);
  const [bounds, setBounds] = useState({ minTop: 0, maxTop: 0, minLeft: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const start = useRef<{ px: number; py: number; x: number; y: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);
  // The latest position while dragging (the state can lag behind the pointer events).
  const dragPos = useRef<{ x: number; y: number } | null>(null);

  const measure = useCallback(() => setBounds(verticalBounds()), []);
  // Measured after the top bar and the bottom navigation are painted, and again on resize.
  useEffect(() => {
    const frame = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);
  const measured = bounds.maxTop > 0;
  // The slide between positions is only for moves after the first placement (D-255): on opening a
  // screen, Fuerte appears already at the bottom instead of sliding down from the top.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!measured || settled) return;
    const frame = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(frame);
  }, [measured, settled]);

  const top = clamp(place.top ?? bounds.maxTop, bounds.minTop, bounds.maxTop);

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    start.current = { px: e.clientX, py: e.clientY, x: rect.left, y: rect.top, moved: false };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.px;
    const dy = e.clientY - s.py;
    if (!s.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!s.moved) {
      s.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setOpen(false);
    }
    dragPos.current = {
      x: clamp(s.x + dx, bounds.minLeft, window.innerWidth - SIZE),
      y: clamp(s.y + dy, bounds.minTop, bounds.maxTop),
    };
    setDrag(dragPos.current);
  };
  const onPointerEnd = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    start.current = null;
    const last = dragPos.current;
    dragPos.current = null;
    if (!s?.moved || !last) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    // Snap to the nearest side, inside the free band.
    const next: Place = { side: last.x + SIZE / 2 < (bounds.minLeft + window.innerWidth) / 2 ? 'left' : 'right', top: clamp(last.y, bounds.minTop, bounds.maxTop) };
    setPlace(next);
    savePlace(next);
    setDrag(null);
    justDragged.current = true;
  };

  const switchSide = () => {
    const next: Place = { side: place.side === 'right' ? 'left' : 'right', top: place.top };
    setPlace(next);
    savePlace(next);
  };

  const style = drag
    ? { left: drag.x, top: drag.y }
    : place.side === 'right'
      ? { right: sideMargin(), top }
      : { left: bounds.minLeft + sideMargin(), top };

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setReadSignature(signature);
          setBubble(undefined);
        }
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          data-fuerte-fab
          aria-label={
            unread && hasAlert && count > 0
              ? `${t('wallet.fuerte.badgeAlert')}. ${t('wallet.fuerte.badge', { count })}`
              : unread && count > 0
                ? t('wallet.fuerte.badge', { count })
                : unread
                  ? t('wallet.fuerte.unread')
                  : t('wallet.fuerte.open')
          }
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onClick={(e) => {
            // A drag ends with a click: it moves Fuerte, it does not open the panel.
            if (justDragged.current) {
              justDragged.current = false;
              e.preventDefault();
            }
          }}
          style={style}
          className={cn(
            !measured && 'invisible',
            'group fixed z-30 flex size-20 touch-none items-center justify-center rounded-full outline-offset-2 select-none focus-visible:outline-2 focus-visible:outline-primary',
            drag ? 'cursor-grabbing' : cn('cursor-grab', settled && 'transition-[top] duration-200 ease-standard motion-reduce:transition-none'),
          )}
        >
          {/* Fuerte alone, bigger and without a background: an 80 px target that is easy to tap */}
          <span className="pointer-events-none transition-transform duration-150 ease-standard group-hover:-translate-y-0.5 motion-reduce:transform-none">
            <Fuerte state={mood} lights={lights} size={4.5} />
          </span>
          {unread && <FuerteBadge alert={hasAlert} count={count} />}
        </button>
      </PopoverPrimitive.Trigger>
      {/* The bubble beside Fuerte: one notice, a few seconds, and a tap opens the panel */}
      <div aria-live="polite" className="sr-only">
        {bubble ? noticeText(bubble) : ''}
      </div>
      {bubble && measured && !drag && !open && (
        <div
          data-fuerte-bubble
          style={place.side === 'right' ? { right: sideMargin() + SIZE + 4, top: top + 8 } : { left: bounds.minLeft + sideMargin() + SIZE + 4, top: top + 8 }}
          className="fixed z-30 flex w-64 max-w-[calc(100vw-7.5rem)] animate-in items-start gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest py-1 pr-1 pl-3 shadow-elevation-1 fade-in-0 zoom-in-95 print:hidden"
        >
          <button type="button" aria-hidden tabIndex={-1} onClick={() => setOpen(true)} className="min-w-0 flex-1 py-1.5 text-left text-body-small text-on-surface">
            {noticeText(bubble)}
          </button>
          <IconButton icon="close" size="xs" label={t('wallet.fuerte.peekClose')} onClick={() => setBubble(undefined)} />
        </div>
      )}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          align={place.side === 'right' ? 'end' : 'start'}
          sideOffset={12}
          collisionPadding={12}
          aria-label={t('wallet.fuerte.title')}
          // Focus goes to the panel itself, so no tooltip pops up on its first button
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement | null)?.focus();
          }}
          className={cn(
            'z-40 flex max-h-[calc(100dvh-10rem)] w-80 max-w-[calc(100vw-1.5rem)] flex-col gap-3 overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-elevation-2 outline-none',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          )}
        >
          {/* Header as a chat (D-291), with the alternative to dragging always at hand (WCAG 2.5.7) */}
          <FuerteSpeech
            mood={mood}
            lights={lights}
            message={message}
            actions={
              <>
                <IconButton icon="swap_horiz" size="xs" label={t(place.side === 'right' ? 'wallet.fuerte.moveLeft' : 'wallet.fuerte.moveRight')} onClick={switchSide} />
                <PopoverPrimitive.Close asChild>
                  <IconButton icon="close" size="xs" label={t('wallet.fuerte.close')} />
                </PopoverPrimitive.Close>
              </>
            }
          />

          {upToDate && <UpToDate />}

          {notices.length > 0 && (
            <div className="flex flex-col">
              <p className="pb-1 text-label-large text-on-surface-variant">{t('wallet.fuerte.noticesTitle')}</p>
              <ul className="-mx-2 flex flex-col">
                {shown.map((n) => (
                  <li key={n.id}>
                    <PopoverPrimitive.Close asChild>
                      <Link to={n.to} className={noticeRowClass}>
                        <NoticeRowContent notice={n} />
                      </Link>
                    </PopoverPrimitive.Close>
                  </li>
                ))}
              </ul>
              {notices.length > NOTICES_SHOWN && (
                <Button variant="text" size="xs" className="-mr-2 self-end" trailingIcon={showAll ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
                  {showAll ? t('wallet.fuerte.fewerNotices') : t('wallet.fuerte.moreNotices', { count: notices.length - NOTICES_SHOWN })}
                </Button>
              )}
            </div>
          )}

          {/* "¿Por qué importa?" folded into one line: the screen has its own button too (D-288) */}
          {why && (
            <div className="flex flex-col">
              <button
                type="button"
                aria-expanded={whyOpen}
                onClick={() => setWhyOpen((v) => !v)}
                className="-mx-2 flex min-h-10 items-center gap-2 rounded-md px-2 text-left text-label-large text-on-surface hover:bg-surface-container"
              >
                <span aria-hidden className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-warning-container text-on-warning-container">
                  <Icon name="lightbulb" size={16} />
                </span>
                <span className="flex-1">{t('wallet.fuerte.whyTitle')}</span>
                <Icon name="keyboard_arrow_down" size={18} className={cn('text-on-surface-variant transition-transform duration-150', whyOpen && 'rotate-180')} />
              </button>
              {whyOpen && <p className="pt-1 pl-7 text-body-small text-on-surface-variant">{why}</p>}
            </div>
          )}
          {children}

          {/* The drag hint, until it is read */}
          {!hintSeen && (
            <div className="-mx-1 flex items-center gap-2 rounded-md bg-surface-container px-3 py-1.5">
              <Icon name="swap_horiz" size={16} className="shrink-0 text-on-surface-variant" />
              <p className="min-w-0 flex-1 text-body-small text-on-surface-variant">{t('wallet.fuerte.dragHint')}</p>
              <IconButton
                icon="close"
                size="xs"
                label={t('wallet.fuerte.dragHintClose')}
                onClick={() => {
                  setHintSeen(true);
                  try {
                    localStorage.setItem(HINT_KEY, '1');
                  } catch {
                    // Hidden for this visit only.
                  }
                }}
              />
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
