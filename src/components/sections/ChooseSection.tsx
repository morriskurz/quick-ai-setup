import { useState } from 'react';
import { useContent } from '../../hooks/langContext';
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
  const { agents, sectionCopy, ui } = useContent();
  const { agent: copy, os: osCopy } = sectionCopy;
  // At least one agent stays selected: unticking the last one is refused and explained.
  const [keptLast, setKeptLast] = useState(false);
  const toggleAgent = (id: AgentId) => {
    const isLast = selection.agents.length === 1 && selection.agents[0] === id;
    setKeptLast(isLast);
    if (!isLast) onToggleAgent(id);
  };
  const showAgentHint = keptLast || selection.agents.length === 0;
  return (
    <Section id="choose" title={copy.title} intro={<p className="m-0">{copy.intro}</p>}>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="ccc-visually-hidden">{ui.choose.agentsLegend}</legend>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr))]">
          {agents.map((a) => (
            <Choice
              key={a.id}
              id={`agent-${a.id}`}
              checked={selection.agents.includes(a.id)}
              onChange={() => toggleAgent(a.id)}
              label={a.label}
              tag={a.recommended ? ui.choose.recommended : undefined}
              summary={a.summary}
            />
          ))}
        </div>
        {/* COPY: owner review. Live region is always mounted so screen readers announce the hint. */}
        <p role="status" className={showAgentHint ? 'mt-4 mb-0 text-nav text-ink-body' : 'm-0'}>
          {showAgentHint ? ui.choose.keepOneAgent : ''}
        </p>
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
        <p className="mt-3 mb-0 text-nav text-ink-muted">{ui.choose.detectedOs}</p>
      </fieldset>
    </Section>
  );
}
