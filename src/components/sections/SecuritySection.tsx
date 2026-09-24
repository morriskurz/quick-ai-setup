import { useContent } from '../../hooks/langContext';
import type { Selection, SetupPlan } from '../../content/types';
import { Section } from '../ui/Section';

interface SecuritySectionProps {
  plan: SetupPlan;
  selection: Selection;
}

/** What the prompt does, how to read commands, and each picked agent's permission mode. */
export function SecuritySection({ plan, selection }: SecuritySectionProps) {
  const { securityCopy, ui } = useContent();
  const human = plan.steps.filter((s) => s.kind === 'human').length;
  const auto = plan.steps.length - human;
  const picked = securityCopy.permissionModes.filter((m) => (selection.agents as string[]).includes(m.agent));
  const modes = picked.length > 0 ? picked : securityCopy.permissionModes;
  return (
    <Section
      id="security"
      title={securityCopy.title}
      intro={
        <p className="m-0">{ui.security.count(plan.steps.length, auto, human)}</p>
      }
    >
      <div className="flex flex-col gap-8">
        {securityCopy.blocks.map((b, i) => (
          <div key={i} className="max-w-copy border-t border-hairline pt-5">
            <h3 className="m-0 text-ui font-semibold text-ink">{b.title}</h3>
            <p className="mt-2 mb-0 text-ui leading-[1.65] text-ink-body">{b.body}</p>
            {i === securityCopy.blocks.length - 1 && (
              <dl className="mt-5 mb-0 grid gap-3">
                {modes.map((m) => (
                  <div key={m.agent} className="ccc-hairline-card p-4">
                    <dt className="font-mono text-meta text-cyan">{m.label}</dt>
                    <dd className="m-0 mt-1.5 text-nav leading-[1.65] text-ink-body">
                      {m.body}{' '}
                      <a className="ccc-link" href={m.url} target="_blank" rel="noopener noreferrer">
                        {ui.security.permissionDocs}
                        <span className="ccc-visually-hidden">{ui.security.permissionDocsFor(m.label)}</span>
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        ))}
        <p className="m-0 max-w-copy border-t border-hairline pt-5 text-nav leading-[1.65] text-ink-body">
          {securityCopy.trust}
        </p>
      </div>
    </Section>
  );
}
