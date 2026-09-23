import { CONSULTING as C } from '../consulting';
import { Button, EyebrowLabel, GradientHeadline, MetaRow } from '../ds';
import { useReveal } from '../../hooks/useReveal';

const isExternal = (url: string) => /^https?:\/\//.test(url);

/**
 * Consulting offer: photo beside copy on desktop, stacked on mobile. The photo
 * frame applies the brand's photo treatment (cool/dark grade, cyan tint,
 * vignette, 5% grain) to any image dropped into CONSULTING.photoSrc.
 */
export function ConsultingSection() {
  const ref = useReveal<HTMLElement>();
  const external = isExternal(C.bookingUrl);
  return (
    <section
      ref={ref}
      id="consulting"
      aria-labelledby="consulting-heading"
      className="ccc-reveal mx-auto grid max-w-page scroll-mt-6 items-center gap-10 px-gutter py-24 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 lg:py-32"
    >
      <figure className="m-0 w-full max-w-[420px]">
        <div className="ccc-photo" style={{ aspectRatio: `${C.photoWidth} / ${C.photoHeight}` }}>
          {C.photoSrc ? (
            <img
              src={C.photoSrc}
              alt={C.photoAlt}
              width={C.photoWidth}
              height={C.photoHeight}
              loading="lazy"
              decoding="async"
              className="ccc-photo__img"
            />
          ) : (
            <span className="ccc-photo__empty ccc-meta">Photo</span>
          )}
          <span aria-hidden="true" className="ccc-photo__tint" />
        </div>
        <figcaption className="mt-4 flex flex-col gap-1">
          <span className="text-ui font-semibold text-ink">{C.name}</span>
          <span className="ccc-meta">{C.role}</span>
        </figcaption>
      </figure>

      <div className="flex max-w-copy flex-col items-start gap-[22px]">
        <EyebrowLabel>{C.eyebrow}</EyebrowLabel>
        <GradientHeadline as="h2" size="section" id="consulting-heading" lead={C.lead} gradient={C.gradient} />
        <p className="m-0 max-w-measure text-body text-ink-body">{C.body}</p>
        <p className="m-0 max-w-measure text-ui leading-[1.65] text-ink-body">{C.bio}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Button
            variant="primary"
            href={C.bookingUrl}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {C.cta}
            {external && <span className="ccc-visually-hidden"> (opens in a new tab)</span>}
          </Button>
          <a className="ccc-link text-ui" href={C.secondaryLink.href} target="_blank" rel="noopener noreferrer">
            {C.secondaryLink.label}
            <span className="ccc-visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
        <MetaRow className="mt-1" items={C.meta} />
      </div>
    </section>
  );
}
