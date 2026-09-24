import type { CSSProperties, ElementType, ReactNode } from 'react';

interface EyebrowLabelProps {
  children: ReactNode;
  /** Show the 22 × 1px cyan rule before the label. */
  rule?: boolean;
  as?: ElementType;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

/** Mono, sentence-case kicker with a short cyan rule. (The brand's uppercase tracking was dropped, owner decision 2026-09-24.) */
export function EyebrowLabel({ children, rule = true, as: Tag = 'div', className = '', id, style }: EyebrowLabelProps) {
  return (
    <Tag id={id} style={style} className={`ccc-eyebrow ${className}`}>
      {rule && <span aria-hidden="true" className="ccc-eyebrow__rule" />}
      {children}
    </Tag>
  );
}
