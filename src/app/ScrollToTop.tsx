import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Every change of screen starts at the top (D-231), as a new page would. It runs as a layout effect,
 * so the return to a wallet screen from a guide (D-78, `useRestoreScroll`, an effect with a frame
 * delay) still lands where the person was. Only the path counts: changing a filter in the query
 * string keeps the position.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}
