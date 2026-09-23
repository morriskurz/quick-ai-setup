import { startCopy as copy } from '../../content';
import type { Selection } from '../../content/types';
import { CodeBlock } from '../ui/CodeBlock';
import { Section } from '../ui/Section';

/** After the setup: how to start real work — /grill-me inside a project folder. */
export function StartSection({ selection }: { selection: Selection }) {
  const hasOthers = selection.agents.some((a) => a !== 'claude-code');
  return (
    <Section id="get-started" eyebrow={copy.eyebrow} title={copy.title} intro={<p className="m-0">{copy.intro}</p>}>
      <CodeBlock code={copy.example} label="Claude Code" context="grill-me example" wrap />
      {hasOthers && <p className="mt-4 mb-0 max-w-measure text-nav leading-[1.65] text-ink-body">{copy.otherAgents}</p>}
    </Section>
  );
}
