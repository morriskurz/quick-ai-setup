import { heroCopy } from '../../content';
import { useReveal } from '../../hooks/useReveal';

/** The hero's longer argument (heroCopy.body), set as prose right under the hero. */
export function Thesis() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} aria-label="Why this page exists" className="ccc-reveal flex max-w-copy flex-col gap-5">
      {heroCopy.body.map((p) => (
        <p key={p.text} className="m-0 max-w-measure text-body text-ink-body">
          {p.text}
          {'source' in p && p.source && (
            <>
              {' '}
              <a className="ccc-link" href={p.source.url} target="_blank" rel="noopener noreferrer">
                {p.source.label}
                <span className="ccc-visually-hidden"> (opens in a new tab)</span>
              </a>
            </>
          )}
        </p>
      ))}
    </section>
  );
}
