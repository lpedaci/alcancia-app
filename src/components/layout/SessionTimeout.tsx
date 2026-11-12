import { AlertDialog } from 'radix-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { SESSION_IDLE_MINUTES, SESSION_WARNING_MINUTES } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { signOut } from '@/features/auth/auth-service';
import { useSessionStore } from '@/store/session-store';

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
const ACTIVITY_THROTTLE_MS = 5_000;

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * Idle session expiry with a previous warning (CLAUDE.md F0, WCAG 2.2.1): the warning opens at
 * minute 13 with the option to stay, and the session closes at minute 15. Activity extends the
 * session, except while the warning is open: only "Seguir conectado" does.
 */
export function SessionTimeout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useSessionStore((s) => s.session);
  const warningOpen = useSessionStore((s) => s.warningOpen);
  const [now, setNow] = useState(() => Date.now());
  const stayRef = useRef<HTMLButtonElement>(null);
  const active = Boolean(session);

  useEffect(() => {
    if (!active) return;
    let last = 0;
    const onActivity = () => {
      const state = useSessionStore.getState();
      if (state.warningOpen || Date.now() - last < ACTIVITY_THROTTLE_MS) return;
      last = Date.now();
      state.touch();
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const current = useSessionStore.getState();
      if (!current.session) return;
      const idle = Date.now() - Date.parse(current.session.lastActivityAt);
      setNow(Date.now());
      if (idle >= SESSION_IDLE_MINUTES * 60_000) {
        signOut('expired');
        navigate('/login', { replace: true });
      } else if (idle >= SESSION_WARNING_MINUTES * 60_000 && !current.warningOpen) {
        current.setWarningOpen(true);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [active, navigate]);

  if (!session) return null;
  const remaining = Date.parse(session.lastActivityAt) + SESSION_IDLE_MINUTES * 60_000 - now;

  const stay = () => {
    const state = useSessionStore.getState();
    state.touch();
    state.setWarningOpen(false);
  };

  return (
    <AlertDialog.Root open={warningOpen}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-scrim/32 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <AlertDialog.Content
          className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-2 duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          onEscapeKeyDown={stay}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            stayRef.current?.focus();
          }}
        >
          <AlertDialog.Title className="text-title-large text-on-surface">{t('session.warningTitle')}</AlertDialog.Title>
          <AlertDialog.Description className="text-body-medium text-on-surface-variant">
            {t('session.warningBody', { minutes: SESSION_IDLE_MINUTES })}{' '}
            {/* Visual countdown; not announced every second. */}
            <span aria-hidden className="text-on-surface tabular-nums">
              {t('session.countdown', { time: formatRemaining(remaining) })}
            </span>
          </AlertDialog.Description>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialog.Action asChild>
              <Button
                variant="outlined"
                fullWidth
                className="sm:w-auto"
                onClick={() => {
                  signOut('manual');
                  navigate('/login', { replace: true });
                }}
              >
                {t('session.signOut')}
              </Button>
            </AlertDialog.Action>
            <AlertDialog.Cancel asChild>
              <Button ref={stayRef} fullWidth className="sm:w-auto" onClick={stay}>
                {t('session.stay')}
              </Button>
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
