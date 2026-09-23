/** Pause after "Copied" appears, so the reader sees it before the page moves. */
const DELAY_MS = 450;

/**
 * After the prompt is copied, bring the reader to "How to get started".
 * Smooth scroll unless reduced motion is on; focus moves to the heading for keyboard and screen-reader users.
 */
export function goToGetStarted() {
  window.setTimeout(() => {
    const heading = document.getElementById('get-started-heading');
    if (!heading) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    heading.closest('section')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }, DELAY_MS);
}
