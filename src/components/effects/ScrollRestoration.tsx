import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollRestoration = () => {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    // Disable automatic browser scroll restoration so page jumps instantly to top
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const html = document.documentElement;
    const body = document.body;

    const prevHtmlBehavior = html.style.scrollBehavior;
    const prevBodyBehavior = body.style.scrollBehavior;

    html.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';

    // Instant jump to (0, 0)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
    html.scrollTop = 0;
    body.scrollTop = 0;

    // Restore original scroll behavior after jump
    const timer = setTimeout(() => {
      html.style.scrollBehavior = prevHtmlBehavior;
      body.style.scrollBehavior = prevBodyBehavior;
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, search]);

  return null;
};
