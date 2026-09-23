import type { CSSProperties } from 'react';

interface GradientHeadlineProps {
  /** First sentence, solid near-white. */
  lead: string;
  /** Second sentence, the cyan → white → magenta sweep. Exactly one per headline. */
  gradient?: string;
  as?: 'h1' | 'h2' | 'h3';
  /** `display` = hero (clamp 44–80px). `section` = in-page section head (addition, clamp 30–44px). */
  size?: 'display' | 'section';
  className?: string;
  id?: string;
  style?: CSSProperties;
}

/** Display headline: two short sentences, the second carries the gradient. */
export function GradientHeadline({
  lead,
  gradient,
  as: Tag = 'h1',
  size = 'display',
  className = '',
  id,
  style,
}: GradientHeadlineProps) {
  const sizeCls = size === 'display' ? 'text-display' : 'text-section';
  return (
    <Tag id={id} style={style} className={`m-0 font-sans font-bold text-ink-display ${sizeCls} ${className}`}>
      {lead}
      {gradient && (
        <>
          <br />
          <span className="ccc-gradient-text">{gradient}</span>
        </>
      )}
    </Tag>
  );
}
