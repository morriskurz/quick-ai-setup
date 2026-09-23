import { useEffect, useRef, useState } from 'react';

interface Line {
  key: string;
  text: string;
}

/** Stable keys: the n-th occurrence of identical text keeps the same key across renders. */
function toLines(text: string): Line[] {
  const seen = new Map<string, number>();
  return text.split('\n').map((t) => {
    const n = seen.get(t) ?? 0;
    seen.set(t, n + 1);
    return { key: `${n}\u0000${t}`, text: t };
  });
}

interface PromptViewProps {
  text: string;
  className?: string;
  label: string;
}

/**
 * The generated prompt as a scrollable mono block. Lines that appear after a
 * change fade in and settle from cyan to their resting colour, and the block
 * scrolls the first new line into view — so ticking a box visibly changes the
 * output. The first render highlights nothing.
 */
export function PromptView({ text, className = '', label }: PromptViewProps) {
  const [prevText, setPrevText] = useState(text);
  const [fresh, setFresh] = useState<ReadonlySet<string>>(() => new Set());
  const scroller = useRef<HTMLPreElement>(null);

  // Derive "new lines" while rendering (React's previous-value pattern).
  if (text !== prevText) {
    const before = new Set(toLines(prevText).map((l) => l.key));
    setFresh(new Set(toLines(text).filter((l) => !before.has(l.key) && l.text.trim() !== '').map((l) => l.key)));
    setPrevText(text);
  }

  const lines = toLines(text);

  useEffect(() => {
    const el = scroller.current;
    if (!el || fresh.size === 0) return;
    const first = el.querySelector<HTMLElement>('[data-fresh]');
    if (!first) return;
    const top = first.offsetTop;
    const bottom = top + first.offsetHeight;
    if (top >= el.scrollTop && bottom <= el.scrollTop + el.clientHeight) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ top: Math.max(0, top - 24), behavior: reduce ? 'auto' : 'smooth' });
  }, [fresh]);

  return (
    <pre
      ref={scroller}
      tabIndex={0}
      aria-label={label}
      className={`ccc-scroll relative m-0 overflow-auto font-mono text-code whitespace-pre-wrap text-ink [overflow-wrap:anywhere] ${className}`}
    >
      <code>
        {lines.map((l) => {
          const isFresh = fresh.has(l.key);
          return (
            <span key={l.key} data-fresh={isFresh || undefined} className={`block ${isFresh ? 'ccc-line-new' : ''}`}>
              {l.text === '' ? ' ' : l.text}
            </span>
          );
        })}
      </code>
    </pre>
  );
}
