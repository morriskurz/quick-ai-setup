import type { CSSProperties } from 'react';
import { Button, EyebrowLabel, GradientHeadline, MetaRow, MotifBackdrop } from '../ds';
import { HeroMotif } from '../motif/HeroMotif';

// COPY: owner review — hero copy lives here until the content exports carry it.
const HERO = {
  eyebrow: 'AI setup for small businesses',
  lead: 'A working AI setup.',
  gradient: 'In one sitting.',
  body: 'Tick what you want to get done, then copy one prompt into your coding agent or run each step yourself — for brokerages, builders, trades, hotels and other family-run businesses.',
  primary: { label: 'Build your prompt', href: '#choose' },
  secondary: { label: 'See every step', href: '#your-setup' },
  meta: ['Open source', 'No account on this site', 'Windows, macOS and Linux'],
};

const enter = (delay: number): CSSProperties => ({ '--enter-delay': `${delay}s` }) as CSSProperties;

/**
 * Hero over the live motif. Layer stack per the hero kit: ground → cyan/magenta
 * bloom → motif (right 78%, masked in from the left) → scrim → vignette → grain.
 * The copy is plain HTML and paints before three.js is even requested.
 */
export function Hero() {
  return (
    <MotifBackdrop
      as="section"
      aria-labelledby="hero-heading"
      scrim="left"
      scrimNarrow="none"
      darken={0}
      vignette={0.7}
      className="min-h-[100svh]"
      motif={
        <>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 [background:var(--ccc-bloom)]" />
          <div
            aria-hidden="true"
            className="hero-motif pointer-events-none absolute inset-y-0 right-0 w-full md:w-[78%]"
          >
            <HeroMotif />
          </div>
        </>
      }
    >
      <div className="mx-auto box-border flex min-h-[100svh] w-full max-w-page flex-col justify-center px-gutter pt-[130px] pb-[100px]">
        <div className="flex max-w-copy flex-col items-start gap-[26px]">
          <EyebrowLabel className="ccc-enter" style={enter(0.22)}>
            {HERO.eyebrow}
          </EyebrowLabel>
          <GradientHeadline
            id="hero-heading"
            lead={HERO.lead}
            gradient={HERO.gradient}
            className="ccc-enter"
            style={enter(0.32)}
          />
          <p className="ccc-enter m-0 max-w-measure text-body text-ink-body" style={enter(0.44)}>
            {HERO.body}
          </p>
          <div className="ccc-enter mt-1.5 flex flex-wrap items-center gap-[14px]" style={enter(0.56)}>
            <Button variant="primary" href={HERO.primary.href}>
              {HERO.primary.label}
            </Button>
            <Button variant="secondary" href={HERO.secondary.href}>
              {HERO.secondary.label}
            </Button>
          </div>
          <MetaRow className="ccc-enter mt-2.5" style={enter(0.68)} items={HERO.meta} />
        </div>
      </div>
    </MotifBackdrop>
  );
}
