import { ADMIN_NOTE_PREFIX, HOUSE_RULES_STEP_ID, sectionCopy, VERIFY_STEP_ID } from '../../content';
import { needsAdmin, renderCommand } from '../../lib/generate';
import type { OsId, Selection, Step } from '../../content/types';
import { EyebrowLabel } from '../ds';
import { CodeBlock } from '../ui/CodeBlock';
import { OS_LABEL, OS_SHELL } from '../ui/os';
import { RichText } from '../ui/RichText';

const copy = sectionCopy.setup;

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
  /** buildVerifyScript(selection) — the verify step has no commands of its own. */
  verifyScript: string;
}

/** One manual step: title, why, what you do yourself, the commands for this OS, and any warning. */
export function StepItem({ step, index, selection, os, verifyScript }: StepItemProps) {
  const ctx = { agents: selection.agents, os };
  const isVerify = step.id === VERIFY_STEP_ID;
  const commands = step.commands?.[os] ?? [];
  const blockLabel = `${OS_LABEL[os]} · ${OS_SHELL[os]}`;
  const num = String(index + 1).padStart(2, '0');
  const titleId = `step-${step.id}-title`;
  const hasRunnable = commands.length > 0 || isVerify;

  return (
    <li aria-labelledby={titleId} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 border-t border-hairline pt-6 sm:gap-x-6">
      <span aria-hidden="true" className="pt-[3px] font-mono text-meta text-cyan">
        {num}
      </span>
      <div className="flex min-w-0 flex-col gap-3">
        <h4 id={titleId} className="m-0 text-body font-semibold leading-snug text-ink">
          {step.title}
        </h4>
        <p className="m-0 max-w-measure text-ui leading-[1.65] text-ink-body">
          <RichText text={step.why} />
        </p>

        {hasRunnable && (
          <div className="mt-1 flex flex-col gap-3">
            <EyebrowLabel as="p" className="m-0">
              {copy.commandStepLabel}
            </EyebrowLabel>
            {isVerify ? (
              <CodeBlock
                code={verifyScript}
                label={blockLabel}
                context={`script for ${step.title}`}
                docsUrl={step.docsUrl}
                docsLabel={copy.docsLabel}
              />
            ) : (
              commands.map((cmd, i) => {
                const text = renderCommand(cmd, ctx);
                const admin = needsAdmin(cmd, ctx);
                const noteSaysAdmin = cmd.note?.startsWith(ADMIN_NOTE_PREFIX) ?? false;
                const context = commands.length > 1 ? `command ${i + 1} for ${step.title}` : `command for ${step.title}`;
                return (
                  <div key={i} className="flex min-w-0 flex-col gap-2">
                    {admin && !noteSaysAdmin && (
                      // COPY: owner review
                      <p className="ccc-meta m-0 text-cyan">Needs administrator rights: your computer asks for your password.</p>
                    )}
                    <CodeBlock
                      code={text}
                      label={blockLabel}
                      context={context}
                      docsUrl={step.docsUrl}
                      docsLabel={copy.docsLabel}
                    />
                    {cmd.note && (
                      <p className={`m-0 text-nav ${noteSaysAdmin ? 'text-ink' : 'text-ink-body'}`}>
                        <RichText text={cmd.note} />
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {step.human && (
          <div className="ccc-hairline-card mt-1 flex flex-col gap-2.5 p-4">
            <EyebrowLabel as="p" className="m-0">
              {copy.humanStepLabel}
            </EyebrowLabel>
            <p className="m-0 text-ui leading-[1.65] text-ink">
              <RichText text={step.human.instructions} />
            </p>
            {step.human.url && (
              <p className="m-0 text-nav">
                <a className="ccc-link" href={step.human.url} target="_blank" rel="noopener noreferrer">
                  Open {hostOf(step.human.url)}
                  <span className="ccc-visually-hidden"> (opens in a new tab)</span>
                </a>
              </p>
            )}
            {step.id === HOUSE_RULES_STEP_ID && (
              <p className="m-0 text-nav">
                {/* COPY: owner review */}
                <a className="ccc-link" href="#house-rules">
                  See the house rules
                </a>
              </p>
            )}
          </div>
        )}

        {step.kind === 'command' && !hasRunnable && (
          <p className="m-0 text-nav text-ink-body">
            {/* COPY: owner review */}
            No command for {OS_LABEL[os]} here.{' '}
            <a className="ccc-link" href={step.docsUrl} target="_blank" rel="noopener noreferrer">
              Follow the {copy.docsLabel.toLowerCase()}
              <span className="ccc-visually-hidden"> for {step.title} (opens in a new tab)</span>
            </a>
            .
          </p>
        )}

        {step.kind === 'human' && !hasRunnable && (
          <p className="m-0 text-nav">
            <a className="ccc-link" href={step.docsUrl} target="_blank" rel="noopener noreferrer">
              {copy.docsLabel}
              <span className="ccc-visually-hidden"> for {step.title} (opens in a new tab)</span>
            </a>
          </p>
        )}

        {step.warning && (
          <div className="ccc-hairline-card mt-1 flex flex-col gap-2 border-cyan-35 p-4">
            {/* COPY: owner review */}
            <EyebrowLabel as="p" rule={false} className="m-0">
              Warning
            </EyebrowLabel>
            <p className="m-0 text-ui leading-[1.65] text-ink">
              <RichText text={step.warning} />
            </p>
          </div>
        )}
      </div>
    </li>
  );
}
