import { useEffect, useState } from 'react';

/** True while the media query matches; false where matchMedia is unavailable (tests). */
export function useMediaQuery(query: string): boolean {
  const get = () => window.matchMedia?.(query).matches ?? false;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mql = window.matchMedia?.(query);
    if (!mql) return;
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}
