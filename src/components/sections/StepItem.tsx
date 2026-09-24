import { HOUSE_RULES_STEP_ID, isAdminNote, VERIFY_STEP_ID } from '../../content';
import { useContent } from '../../hooks/langContext';
import { needsAdmin, renderCommand } from '../../lib/generate';
import type { OsId, Selection, Step } from '../../content/types';
import { EyebrowLabel } from '../ds';
import { CodeBlock } from '../ui/CodeBlock';
import { OS_LABEL, OS_SHELL } from '../ui/os';
import { RichText } from '../ui/RichText';

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
  const { sectionCopy, ui } = useContent();
  const copy = sectionCopy.setup;
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
                context={ui.step.scriptFor(step.title)}
                docsUrl={step.docsUrl}
                docsLabel={copy.docsLabel}
              />
            ) : (
              commands.map((cmd, i) => {
                const text = renderCommand(cmd, ctx);
                const admin = needsAdmin(cmd, ctx);
                const noteSaysAdmin = isAdminNote(cmd.note);
                const context = commands.length > 1 ? ui.step.commandNFor(i + 1, step.title) : ui.step.commandFor(step.title);
                return (
                  <div key={i} className="flex min-w-0 flex-col gap-2">
                    {admin && !noteSaysAdmin && (
                      <p className="ccc-meta m-0 text-cyan">{ui.step.adminInline}</p>
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
            <p className="m-0 whitespace-pre-line text-ui leading-[1.65] text-ink">
              <RichText text={step.human.instructions} />
            </p>
            {step.human.url && (
              <p className="m-0 text-nav">
                <a className="ccc-link" href={step.human.url} target="_blank" rel="noopener noreferrer">
                  {ui.step.openHost(hostOf(step.human.url))}
                  <span className="ccc-visually-hidden">{ui.newTab}</span>
                </a>
              </p>
            )}
            {step.id === HOUSE_RULES_STEP_ID && (
              <p className="m-0 text-nav">
                <a className="ccc-link" href="#house-rules">
                  {ui.step.seeHouseRules}
                </a>
              </p>
            )}
          </div>
        )}

        {step.kind === 'command' && !hasRunnable && (
          <p className="m-0 text-nav text-ink-body">
            {ui.step.noCommand(OS_LABEL[os])}{' '}
            <a className="ccc-link" href={step.docsUrl} target="_blank" rel="noopener noreferrer">
              {ui.step.followDocs}
              <span className="ccc-visually-hidden">{ui.step.docsForStep(step.title)}</span>
            </a>
            .
          </p>
        )}

        {step.kind === 'human' && !hasRunnable && (
          <p className="m-0 text-nav">
            <a className="ccc-link" href={step.docsUrl} target="_blank" rel="noopener noreferrer">
              {copy.docsLabel}
              <span className="ccc-visually-hidden">{ui.step.docsForStep(step.title)}</span>
            </a>
          </p>
        )}

        {step.warning && (
          <div className="ccc-hairline-card mt-1 flex flex-col gap-2 border-cyan-35 p-4">
            <EyebrowLabel as="p" rule={false} className="m-0">
              {ui.step.warning}
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
