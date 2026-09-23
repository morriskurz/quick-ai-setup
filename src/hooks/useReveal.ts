import { useEffect, useRef } from 'react';

/**
 * One-time scroll reveal with ccc-up. The element is only hidden once JS has
 * armed it (data-reveal="armed"), then shown on first intersection and never
 * animated again. Reduced motion or no IntersectionObserver: shown at once.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window) || el.dataset.reveal === 'shown') {
      el.dataset.reveal = 'shown';
      return;
    }
    el.dataset.reveal = 'armed';
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.reveal = 'shown';
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
