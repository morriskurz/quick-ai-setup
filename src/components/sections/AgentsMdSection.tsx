import type { buildAgentsMd } from '../../lib/generate';
import { CodeBlock } from '../ui/CodeBlock';
import { Section } from '../ui/Section';

export function AgentsMdSection({ files }: { files: ReturnType<typeof buildAgentsMd> }) {
  return (
    <Section
      id="house-rules"
      eyebrow="AGENTS.md and CLAUDE.md"
      // COPY: owner review
      lead="Rules the agent reads."
      gradient="Every session."
      intro={
        <p className="m-0">
          Claude Code reads CLAUDE.md; Codex and OpenCode read AGENTS.md. The prompt writes both with the same
          content. The global file holds rules for every project; put the project template into each new project
          folder.
        </p>
      }
    >
      <div className="flex flex-col gap-6">
        <CodeBlock code={files.global} label="Global rules" context="global rules file" wrap />
        <CodeBlock code={files.project} label="Project template" context="project template file" wrap />
      </div>
    </Section>
  );
}
