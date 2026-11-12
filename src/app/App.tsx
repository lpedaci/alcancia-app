import { createHashRouter, RouterProvider } from 'react-router';
import { RouteErrorPage } from '@/features/system/RouteErrorPage';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './AppRoutes';

/** One catch-all route: the screens keep their <Routes> in AppRoutes. */
export const appRoutes = [
  {
    path: '*',
    // G7 · unexpected error: never the raw stack.
    errorElement: <RouteErrorPage />,
    element: (
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    ),
  },
];

/**
 * Hash routing is required for GitHub Pages: the server only knows `index.html`, so client
 * routes live after the `#`. It is a data router (createHashRouter) so screens can use
 * `useBlocker` to protect unsaved changes (CLAUDE.md 3).
 */
const router = createHashRouter(appRoutes);

export function App() {
  return <RouterProvider router={router} />;
}
