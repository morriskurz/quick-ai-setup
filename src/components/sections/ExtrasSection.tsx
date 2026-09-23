import { extras } from '../../content';
import type { ExtraId, Selection } from '../../content/types';
import { Choice } from '../ui/Choice';
import { Section } from '../ui/Section';

interface ExtrasSectionProps {
  selection: Selection;
  onToggle: (id: ExtraId) => void;
}

export function ExtrasSection({ selection, onToggle }: ExtrasSectionProps) {
  return (
    <Section
      id="extras"
      eyebrow="Extras"
      // COPY: owner review
      lead="Optional."
      gradient="Off by default."
      intro={
        <p className="m-0">
          Both make the agent’s output shorter. That saves money, and it makes mistakes harder to spot — add them
          after a few weeks, not on day one.
        </p>
      }
    >
      {extras.length === 0 ? (
        <p className="m-0 text-nav text-ink-muted">No extras yet.</p>
      ) : (
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
                warning={x.warning}
              />
            ))}
          </div>
        </fieldset>
      )}
    </Section>
  );
}
