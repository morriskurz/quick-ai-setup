import { Fragment, type CSSProperties, type ReactNode } from 'react';

interface MetaRowProps {
  items: ReactNode[];
  className?: string;
  style?: CSSProperties;
}

/** Mono proof line: short noun phrases joined by a dimmed cyan middot. */
export function MetaRow({ items, className = '', style }: MetaRowProps) {
  return (
    <div style={style} className={`ccc-meta ${className}`}>
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden="true" className="ccc-meta__dot">
              {' · '}
            </span>
          )}
          {i > 0 && <span className="ccc-visually-hidden">, </span>}
          {item}
        </Fragment>
      ))}
    </div>
  );
}
