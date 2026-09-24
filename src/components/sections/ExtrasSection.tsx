import { RTK_TELEMETRY_DOCS } from '../../content';
import { useContent } from '../../hooks/langContext';
import type { ExtraId, Selection } from '../../content/types';
import { Choice } from '../ui/Choice';
import { Section } from '../ui/Section';

interface ExtrasSectionProps {
  selection: Selection;
  onToggle: (id: ExtraId) => void;
}

export function ExtrasSection({ selection, onToggle }: ExtrasSectionProps) {
  const { extras, sectionCopy, ui } = useContent();
  const copy = sectionCopy.extras;
  return (
    <Section id="extras" title={copy.title} intro={<p className="m-0">{copy.intro}</p>}>
      {extras.length > 0 && (
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="ccc-visually-hidden">{ui.extras.legend}</legend>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
            {extras.map((x) => (
              <Choice
                key={x.id}
                id={`extra-${x.id}`}
                checked={selection.extras.includes(x.id)}
                onChange={() => onToggle(x.id)}
                label={x.label}
                summary={x.summary}
                warningLabel={ui.extras.note}
                warning={
                  x.id === 'rtk' ? (
                    <>
                      {x.warning}{' '}
                      <a className="ccc-link" href={RTK_TELEMETRY_DOCS} target="_blank" rel="noopener noreferrer">
                        {ui.extras.telemetryDetails}
                        <span className="ccc-visually-hidden">{ui.newTab}</span>
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
