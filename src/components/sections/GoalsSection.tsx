import { useContent } from '../../hooks/langContext';
import type { GoalId, Selection } from '../../content/types';
import { Choice } from '../ui/Choice';
import { Section } from '../ui/Section';

interface GoalsSectionProps {
  selection: Selection;
  onToggle: (id: GoalId) => void;
}

export function GoalsSection({ selection, onToggle }: GoalsSectionProps) {
  const { goals, sectionCopy, ui } = useContent();
  const copy = sectionCopy.goals;
  return (
    <Section id="goals" title={copy.title} intro={<p className="m-0">{copy.intro}</p>}>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="ccc-visually-hidden">{ui.goalsLegend}</legend>
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
    </Section>
  );
}
