import { agents, sectionCopy } from '../../content';
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

const { agent: copy, os: osCopy } = sectionCopy;

/** Step zero: which coding agent(s), and which computer. */
export function ChooseSection({ selection, onToggleAgent, onSetOs }: ChooseSectionProps) {
  return (
    <Section id="choose" eyebrow={copy.eyebrow} title={copy.title} intro={<p className="m-0">{copy.intro}</p>}>
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
          // COPY: owner review
          <p role="status" className="mt-4 mb-0 text-nav text-ink-body">
            Pick at least one agent. The commands need to know where to install skills.
          </p>
        )}
      </fieldset>

      <fieldset className="mt-12 min-w-0 border-0 p-0">
        <legend className="m-0 mb-2 p-0 text-ui font-semibold text-ink">{osCopy.title}</legend>
        <p className="mt-0 mb-4 max-w-measure text-nav text-ink-body">{osCopy.intro}</p>
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
        {/* COPY: owner review */}
        <p className="mt-3 mb-0 text-nav text-ink-muted">We guessed this from your browser.</p>
      </fieldset>
    </Section>
  );
}
