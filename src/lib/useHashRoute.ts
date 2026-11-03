import { useCallback, useEffect, useState } from 'react';
import { parseHash, toHash, type Route } from './route';

/** Keeps the selected store and tab in the URL hash so views can be bookmarked and shared. */
export function useHashRoute(validStoreIds: string[], fallback: Route) {
  const read = useCallback(() => parseHash(window.location.hash, validStoreIds, fallback), [validStoreIds, fallback]);
  const [route, setRoute] = useState<Route>(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
      window.removeEventListener('hashchange', onChange);
      window.removeEventListener('popstate', onChange);
    };
  }, [read]);

  const navigate = useCallback((next: Route) => {
    const hash = toHash(next);
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    setRoute(next);
  }, []);

  return [route, navigate] as const;
}
