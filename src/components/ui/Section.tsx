import type { ReactNode } from 'react';
import { useReveal } from '../../hooks/useReveal';
import { EyebrowLabel, GradientHeadline } from '../ds';
import { splitTitle } from './headline';

interface SectionProps {
  id: string;
  /** Optional label above the headline; only for labels that add information. */
  eyebrow?: string;
  /** Content title; a two-sentence title puts the second sentence in the gradient. */
  title: string;
  /** One or two sentences under the headline. */
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Page section: optional label, two-sentence headline, short intro, content.
 * Reveals once with ccc-up when it first scrolls into view.
 */
export function Section({ id, eyebrow, title, intro, children, className = '' }: SectionProps) {
  const { lead, gradient } = splitTitle(title);
  const ref = useReveal<HTMLElement>();
  const headingId = `${id}-heading`;
  return (
    <section ref={ref} id={id} aria-labelledby={headingId} className={`ccc-reveal scroll-mt-6 ${className}`}>
      <div className="flex max-w-copy flex-col gap-[18px]">
        {eyebrow && <EyebrowLabel>{eyebrow}</EyebrowLabel>}
        <GradientHeadline as="h2" size="section" id={headingId} lead={lead} gradient={gradient} />
        {intro && <div className="max-w-measure text-body text-ink-body">{intro}</div>}
      </div>
      {children && <div className="mt-10">{children}</div>}
    </section>
  );
}
