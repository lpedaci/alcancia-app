import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { PRIVACY_NOTICE_VERSION } from '@/app/config';
import { SessionTimeout } from '@/components/layout/SessionTimeout';
import { AccessDeniedPage } from '@/features/system/AccessDeniedPage';
import { can, requiredPermission } from '@/lib/permissions';
import { useDataStore } from '@/store/data-store';
import { useCurrentUser, useSessionStore } from '@/store/session-store';

/** Remembers the requested route and sends the visitor to sign in (G1). */
function ToLogin({ returnTo }: { returnTo: string }) {
  useEffect(() => {
    useSessionStore.getState().setReturnTo(returnTo);
  }, [returnTo]);
  return <Navigate to="/login" replace />;
}

/**
 * Guard of every protected route (CLAUDE.md F0, roles.md 3.4): a session, the accepted privacy
 * notice (G5) and the permission of the route in permissions.ts. Without permission it shows
 * "Acceso no permitido" (G7). The idle session expiry runs only inside protected routes.
 */
export function RequireSession() {
  const user = useCurrentUser();
  const { pathname, search } = useLocation();
  const consented = useDataStore((s) =>
    user ? s.consents.some((c) => c.personId === user.personId && c.version === PRIVACY_NOTICE_VERSION) : false,
  );

  if (!user) return <ToLogin returnTo={`${pathname}${search}`} />;
  if (!consented) return <Navigate to="/consent" replace />;
  const action = requiredPermission(pathname);
  if (action && !can(user, action)) return <AccessDeniedPage />;

  return (
    <>
      <Outlet />
      <SessionTimeout />
    </>
  );
}
