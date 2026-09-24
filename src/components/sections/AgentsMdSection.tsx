import { globalInstructionFiles } from '../../content';
import { useContent } from '../../hooks/langContext';
import type { Selection } from '../../content/types';
import type { buildAgentsMd } from '../../lib/generate';
import { CodeBlock } from '../ui/CodeBlock';
import { Section } from '../ui/Section';

interface AgentsMdSectionProps {
  files: ReturnType<typeof buildAgentsMd>;
  selection: Selection;
}

/** House rules: the global rules, where each picked agent keeps them, and the project template. */
export function AgentsMdSection({ files, selection }: AgentsMdSectionProps) {
  const { agents, sectionCopy, ui } = useContent();
  const copy = sectionCopy.houseRules;
  const picked = agents.filter((a) => selection.agents.includes(a.id));
  return (
    <Section id="house-rules" title={copy.title} intro={<p className="m-0">{copy.intro}</p>}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <CodeBlock code={files.global} label={copy.globalLabel} context={copy.globalLabel} wrap />
          {picked.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {picked.map((a) => {
                const f = globalInstructionFiles[a.id];
                return (
                  <li key={a.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-nav text-ink-body">
                    <span className="text-ink">{a.label}</span>
                    <code className="font-mono text-meta text-ink [overflow-wrap:anywhere]">
                      {selection.os === 'windows' ? f.windows : f.posix}
                    </code>
                    <a className="ccc-link" href={f.docsUrl} target="_blank" rel="noopener noreferrer">
                      {sectionCopy.setup.docsLabel}
                      <span className="ccc-visually-hidden">{ui.houseRules.docsForAgent(a.label)}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <CodeBlock code={files.project} label={copy.projectLabel} context={copy.projectLabel} wrap />
      </div>
    </Section>
  );
}
