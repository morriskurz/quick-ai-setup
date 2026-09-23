import type { CSSProperties, ReactNode } from 'react';

const SCRIMS = {
  left: 'linear-gradient(100deg, #010808 0%, rgba(1,8,8,0.86) 26%, rgba(1,8,8,0.18) 58%, transparent 78%)',
  top: 'linear-gradient(182deg, #010808 0%, rgba(1,8,8,0.88) 22%, rgba(1,8,8,0.22) 48%, transparent 68%)',
  topHard: 'linear-gradient(176deg, #010808 0%, rgba(1,8,8,0.90) 24%, rgba(1,8,8,0.28) 46%, transparent 64%)',
  soft: 'linear-gradient(184deg, rgba(1,8,8,0.92) 0%, rgba(1,8,8,0.40) 30%, transparent 58%)',
  none: 'none',
} as const;

export type Scrim = keyof typeof SCRIMS;

interface MotifBackdropProps {
  /** Still motif image. */
  src?: string;
  /** Live motif (e.g. the WebGL scene), rendered in the image slot. Takes precedence over `src`. */
  motif?: ReactNode;
  scrim?: Scrim;
  /** Scrim per breakpoint: `scrimNarrow` below 768px. */
  scrimNarrow?: Scrim;
  opacity?: number;
  darken?: number;
  vignette?: number;
  grain?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'section';
  id?: string;
  'aria-labelledby'?: string;
}

const fill: CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none' };

/**
 * The standard motif treatment, layer order fixed: ground → motif → darkener →
 * directional scrim that clears the type area → vignette → 5% grain. Content
 * passed as children renders on top.
 */
export function MotifBackdrop({
  src,
  motif,
  scrim = 'left',
  scrimNarrow,
  opacity = 0.62,
  darken = 0.18,
  vignette = 0.7,
  grain = true,
  children,
  className = '',
  style,
  as: Tag = 'div',
  ...rest
}: MotifBackdropProps) {
  return (
    <Tag
      {...rest}
      className={`relative overflow-hidden bg-page ${className}`}
      style={
        {
          ...style,
          '--scrim-wide': SCRIMS[scrim],
          '--scrim-narrow': SCRIMS[scrimNarrow ?? scrim],
        } as CSSProperties
      }
    >
      {motif ??
        (src && (
          <img src={src} alt="" style={{ ...fill, width: '100%', height: '100%', objectFit: 'cover', opacity }} />
        ))}
      {darken > 0 && <div aria-hidden="true" style={{ ...fill, background: '#010808', opacity: darken }} />}
      <div
        aria-hidden="true"
        className="[background:var(--scrim-narrow)] md:[background:var(--scrim-wide)]"
        style={fill}
      />
      <div
        aria-hidden="true"
        style={{
          ...fill,
          background: 'radial-gradient(118% 84% at 50% 50%, transparent 42%, rgba(1,8,8,0.72) 100%)',
          opacity: vignette,
        }}
      />
      {grain && (
        <div
          aria-hidden="true"
          style={{
            ...fill,
            opacity: 'var(--ccc-grain-opacity)' as unknown as number,
            mixBlendMode: 'overlay',
            backgroundImage: 'var(--ccc-grain)',
          }}
        />
      )}
      <div className="relative h-full">{children}</div>
    </Tag>
  );
}
