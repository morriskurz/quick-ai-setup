import { extras, RTK_TELEMETRY_DOCS, sectionCopy } from '../../content';
import type { ExtraId, Selection } from '../../content/types';
import { Choice } from '../ui/Choice';
import { Section } from '../ui/Section';

interface ExtrasSectionProps {
  selection: Selection;
  onToggle: (id: ExtraId) => void;
}

const copy = sectionCopy.extras;

export function ExtrasSection({ selection, onToggle }: ExtrasSectionProps) {
  return (
    <Section id="extras" title={copy.title} intro={<p className="m-0">{copy.intro}</p>}>
      {extras.length > 0 && (
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="ccc-visually-hidden">Extras</legend>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
            {extras.map((x) => (
              <Choice
                key={x.id}
                id={`extra-${x.id}`}
                checked={selection.extras.includes(x.id)}
                onChange={() => onToggle(x.id)}
                label={x.label}
                summary={x.summary}
                warning={
                  x.id === 'rtk' ? (
                    <>
                      {x.warning}{' '}
                      {/* COPY: owner review — link label */}
                      <a className="ccc-link" href={RTK_TELEMETRY_DOCS} target="_blank" rel="noopener noreferrer">
                        Telemetry details
                        <span className="ccc-visually-hidden"> (opens in a new tab)</span>
                      </a>
                    </>
                  ) : (
                    x.warning
                  )
                }
              />
            ))}
          </div>
        </fieldset>
      )}
    </Section>
  );
}
