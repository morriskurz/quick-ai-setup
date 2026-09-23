import { goals, sectionCopy } from '../../content';
import type { GoalId, Selection } from '../../content/types';
import { Choice } from '../ui/Choice';
import { Section } from '../ui/Section';

interface GoalsSectionProps {
  selection: Selection;
  onToggle: (id: GoalId) => void;
}

const { goals: copy, notIncluded } = sectionCopy;

export function GoalsSection({ selection, onToggle }: GoalsSectionProps) {
  return (
    <Section id="goals" eyebrow={copy.eyebrow} title={copy.title} intro={<p className="m-0">{copy.intro}</p>}>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="ccc-visually-hidden">Goals</legend>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]">
          {goals.map((g) => (
            <Choice
              key={g.id}
              id={`goal-${g.id}`}
              checked={selection.goals.includes(g.id)}
              onChange={() => onToggle(g.id)}
              label={g.label}
              summary={g.summary}
            />
          ))}
        </div>
      </fieldset>
      <aside aria-labelledby="not-included-title" className="mt-8 max-w-copy border-t border-hairline pt-5">
        <h3 id="not-included-title" className="m-0 text-ui font-semibold text-ink">
          {notIncluded.title}
        </h3>
        <p className="mt-2 mb-0 text-nav leading-[1.65] text-ink-body">
          {notIncluded.body}{' '}
          <a className="ccc-link" href={notIncluded.url} target="_blank" rel="noopener noreferrer">
            {notIncluded.url.replace(/^https?:\/\//, '')}
            <span className="ccc-visually-hidden"> (opens in a new tab)</span>
          </a>
        </p>
      </aside>
    </Section>
  );
}
