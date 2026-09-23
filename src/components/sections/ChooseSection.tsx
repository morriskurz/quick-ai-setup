import { agents } from '../../content';
import type { AgentId, OsId, Selection } from '../../content/types';
import { OS_IDS } from '../../hooks/selectionStore';
import { Choice } from '../ui/Choice';
import { OS_LABEL } from '../ui/os';
import { Section } from '../ui/Section';

interface ChooseSectionProps {
  selection: Selection;
  onToggleAgent: (id: AgentId) => void;
  onSetOs: (os: OsId) => void;
}

/** Step zero: which coding agent(s), and which computer. */
export function ChooseSection({ selection, onToggleAgent, onSetOs }: ChooseSectionProps) {
  return (
    <Section
      id="choose"
      eyebrow="Step zero"
      // COPY: owner review
      lead="Pick your coding agent."
      gradient="We recommend one."
      intro={
        <p className="m-0">
          The agent is the program that reads your prompt and does the work on your computer. Tick more than one if
          you use several — every command below installs for each agent you tick.
        </p>
      }
    >
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="ccc-visually-hidden">Coding agents</legend>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr))]">
          {agents.map((a) => (
            <Choice
              key={a.id}
              id={`agent-${a.id}`}
              checked={selection.agents.includes(a.id)}
              onChange={() => onToggleAgent(a.id)}
              label={a.label}
              tag={a.recommended ? 'recommended' : undefined}
              summary={a.summary}
            />
          ))}
        </div>
        {selection.agents.length === 0 && (
          <p role="status" className="mt-4 mb-0 text-nav text-ink-body">
            Pick at least one agent. The commands need to know where to install skills.
          </p>
        )}
      </fieldset>

      <fieldset className="mt-12 min-w-0 border-0 p-0">
        <legend className="m-0 mb-4 p-0 text-ui font-semibold text-ink">Your computer</legend>
        <div className="ccc-segment">
          {OS_IDS.map((os) => (
            <label key={os} className="ccc-segment__item">
              <input
                type="radio"
                name="os"
                value={os}
                className="ccc-visually-hidden"
                checked={selection.os === os}
                onChange={() => onSetOs(os)}
              />
              {OS_LABEL[os]}
            </label>
          ))}
        </div>
        <p className="mt-3 mb-0 text-nav text-ink-body">We guessed this from your browser. Change it if you set up a different computer.</p>
      </fieldset>
    </Section>
  );
}
