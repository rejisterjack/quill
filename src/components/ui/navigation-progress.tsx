'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * NavigationProgress — route-change indicator.
 *
 * Deliberately does NOT render on initial page load (nothing is loading then —
 * a permanent line at the top just looks broken). It only runs a short
 * completion animation after a client-side navigation changes the route.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Skip the initial mount — no navigation happened yet.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    void pathname;
    void searchParams;

    // Navigation has already completed when the pathname changes; play a brief
    // completion sweep instead of faking a loading state.
    setActive(true);
    const hideTimer = setTimeout(() => setActive(false), 450);

    return () => clearTimeout(hideTimer);
  }, [pathname, searchParams]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-[2px] w-full overflow-hidden"
      aria-hidden
    >
      <div
        className="h-full w-full bg-gradient-to-r from-primary via-purple-500 to-primary"
        style={{
          transform: 'scaleX(1)',
          transformOrigin: 'left',
          animation: 'nav-progress-sweep 450ms ease-out forwards',
        }}
      />
    </div>
  );
}
