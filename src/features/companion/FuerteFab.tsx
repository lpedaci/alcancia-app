import { Popover as PopoverPrimitive } from 'radix-ui';
import { type PointerEvent as ReactPointerEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';
import { Fuerte, type FuerteState } from './Fuerte';

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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const sideMargin = () => (window.innerWidth >= 1200 ? 24 : 12);

export function FuerteFab({
  state = 'neutral',
  lights,
  message,
  why,
  notify = true,
  children,
}: {
  state?: FuerteState;
  lights: number;
  message: string;
  why?: string;
  /** "Solo lo importante" (5.0.1): no dot for new messages. */
  notify?: boolean;
  /** Optional action under the message (for example, the active mission). */
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  // A new message shows the dot again until it is read.
  const [readMessage, setReadMessage] = useState<string | null>(null);
  const unread = notify && readMessage !== message;

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
        if (next) setReadMessage(message);
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={unread ? t('wallet.fuerte.unread') : t('wallet.fuerte.open')}
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
            drag ? 'cursor-grabbing' : 'cursor-grab transition-[top] duration-200 ease-standard motion-reduce:transition-none',
          )}
        >
          {/* Fuerte alone, bigger and without a background: an 80 px target that is easy to tap */}
          <span className="pointer-events-none transition-transform duration-150 ease-standard group-hover:-translate-y-0.5 motion-reduce:transform-none">
            <Fuerte state={state} lights={lights} size={4.5} />
          </span>
          {unread && (
            <span aria-hidden className="absolute top-2 right-2 size-3.5 rounded-full border-2 border-surface-container-lowest bg-primary" />
          )}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          align={place.side === 'right' ? 'end' : 'start'}
          sideOffset={12}
          collisionPadding={12}
          aria-label={t('wallet.fuerte.title')}
          className={cn(
            'z-40 flex w-80 max-w-[calc(100vw-1.5rem)] flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-elevation-2 outline-none',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          )}
        >
          <div className="flex items-start gap-3">
            <Fuerte state={state} lights={lights} size={3} />
            <div className="min-w-0 flex-1">
              <p className="text-title-small text-on-surface">{t('wallet.fuerte.title')}</p>
              <p className="text-body-medium text-on-surface">{message}</p>
            </div>
            <PopoverPrimitive.Close asChild>
              <IconButton icon="close" size="xs" label={t('wallet.fuerte.close')} className="-mt-1 -mr-1" />
            </PopoverPrimitive.Close>
          </div>
          {why && (
            <div className="rounded-md bg-info-container px-3 py-2 text-on-info-container">
              <p className="flex items-center gap-1.5 text-label-large">
                <Icon name="lightbulb" size={16} className="text-info" />
                {t('wallet.fuerte.whyTitle')}
              </p>
              <p className="mt-1 text-body-small">{why}</p>
            </div>
          )}
          {children}
          {/* Alternative to dragging (WCAG 2.5.7) */}
          <div className="flex items-center justify-between gap-2 border-t border-outline-variant pt-3">
            <p className="text-body-small text-on-surface-variant">{t('wallet.fuerte.dragHint')}</p>
            <Button variant="text" size="xs" leadingIcon="swap_horiz" onClick={switchSide} className="shrink-0">
              {t(place.side === 'right' ? 'wallet.fuerte.moveLeft' : 'wallet.fuerte.moveRight')}
            </Button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
