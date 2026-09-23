import { Fragment } from 'react';

const TOKEN = /(https?:\/\/[^\s)]+|`[^`]+`)/g;

/**
 * Plain content text with two light touches: bare https URLs become links
 * (new tab) and `backticked` spans become inline mono code. Trailing sentence
 * punctuation stays outside the link.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        if (part.startsWith('`')) {
          return (
            <code key={i} className="font-mono text-[0.9em] text-ink">
              {part.slice(1, -1)}
            </code>
          );
        }
        const m = /^(.*?)([.,;:]*)$/.exec(part)!;
        const url = m[1];
        return (
          <Fragment key={i}>
            <a className="ccc-link [overflow-wrap:anywhere]" href={url} target="_blank" rel="noopener noreferrer">
              {url.replace(/^https?:\/\//, '')}
              <span className="ccc-visually-hidden"> (opens in a new tab)</span>
            </a>
            {m[2]}
          </Fragment>
        );
      })}
    </>
  );
}
