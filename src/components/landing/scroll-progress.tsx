'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ScrollProgress — reading-progress indicator pinned to the top of the viewport.
 *
 * The app shell scrolls inside <main id="main-content"> (the window/body never
 * scrolls), so we listen to that element's scroll events instead of the window.
 * Uses a rAF-throttled passive listener and a transform-only update — no
 * framer-motion spring, no per-frame re-render.
 */
export function ScrollProgress(): React.ReactElement {
  const barRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scroller = document.getElementById('main-content');
    if (!scroller) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const el = barRef.current;
      if (!el) return;

      const { scrollTop, scrollHeight, clientHeight } = scroller;
      const max = scrollHeight - clientHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;

      el.style.transform = `scaleX(${progress})`;
      setVisible(max > 40);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
      aria-hidden="true"
      data-visible={visible}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' }}
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left"
        style={{
          transform: 'scaleX(0)',
          background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(320 100% 60%))',
        }}
      />
    </div>
  );
}
