import { renderCommand } from '../../lib/generate';
import type { OsId, Selection, Step } from '../../content/types';
import { EyebrowLabel } from '../ds';
import { CodeBlock } from '../ui/CodeBlock';
import { OS_LABEL, OS_SHELL } from '../ui/os';

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

interface StepItemProps {
  step: Step;
  index: number;
  selection: Selection;
  os: OsId;
}

/** One manual step: title, why, the human action or the commands for this OS, and any warning. */
export function StepItem({ step, index, selection, os }: StepItemProps) {
  const commands = step.commands?.[os] ?? [];
  const ctx = { agents: selection.agents, os };
  const num = String(index + 1).padStart(2, '0');
  const titleId = `step-${step.id}-title`;

  return (
    <li aria-labelledby={titleId} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 border-t border-hairline pt-6 sm:gap-x-6">
      <span aria-hidden="true" className="pt-[3px] font-mono text-meta text-cyan">
        {num}
      </span>
      <div className="flex min-w-0 flex-col gap-3">
        <h4 id={titleId} className="m-0 text-body font-semibold leading-snug text-ink">
          {step.title}
        </h4>
        <p className="m-0 max-w-measure text-ui leading-[1.65] text-ink-body">{step.why}</p>

        {step.kind === 'human' && step.human && (
          <div className="ccc-hairline-card mt-1 flex flex-col gap-2.5 p-4">
            <EyebrowLabel as="p" className="m-0">
              Do this yourself
            </EyebrowLabel>
            <p className="m-0 text-ui leading-[1.65] text-ink">{step.human.instructions}</p>
            {step.human.url && (
              <p className="m-0 text-nav">
                <a className="ccc-link" href={step.human.url} target="_blank" rel="noopener noreferrer">
                  Open {hostOf(step.human.url)}
                  <span className="ccc-visually-hidden"> (opens in a new tab)</span>
                </a>
              </p>
            )}
          </div>
        )}

        {commands.length > 0 && (
          <div className="mt-1 flex flex-col gap-3">
            {commands.map((cmd, i) => {
              const text = renderCommand(cmd, ctx);
              const context = commands.length > 1 ? `command ${i + 1} for ${step.title}` : `command for ${step.title}`;
              return (
                <div key={i} className="flex min-w-0 flex-col gap-2">
                  <CodeBlock code={text} label={`${OS_LABEL[os]} · ${OS_SHELL[os]}`} context={context} docsUrl={step.docsUrl} />
                  {cmd.note && <p className="m-0 text-nav text-ink-body">{cmd.note}</p>}
                </div>
              );
            })}
          </div>
        )}

        {step.kind === 'command' && commands.length === 0 && (
          <p className="m-0 text-nav text-ink-body">
            No command for {OS_LABEL[os]} here.{' '}
            <a className="ccc-link" href={step.docsUrl} target="_blank" rel="noopener noreferrer">
              Follow the docs
              <span className="ccc-visually-hidden"> for {step.title} (opens in a new tab)</span>
            </a>
            .
          </p>
        )}

        {step.kind === 'human' && commands.length === 0 && (
          <p className="m-0 text-nav">
            <a className="ccc-link" href={step.docsUrl} target="_blank" rel="noopener noreferrer">
              Docs
              <span className="ccc-visually-hidden"> for {step.title} (opens in a new tab)</span>
            </a>
          </p>
        )}

        {step.warning && (
          <div className="ccc-hairline-card mt-1 flex flex-col gap-2 border-cyan-35 p-4">
            <EyebrowLabel as="p" rule={false} className="m-0">
              Warning
            </EyebrowLabel>
            <p className="m-0 text-ui leading-[1.65] text-ink">{step.warning}</p>
          </div>
        )}
      </div>
    </li>
  );
}
