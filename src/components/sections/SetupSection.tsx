import type { OsId, Selection, SetupPlan } from '../../content/types';
import { MetaRow } from '../ds';
import { CopyButton } from '../ui/CopyButton';
import { OS_LABEL, tabId } from '../ui/os';
import { OsTabs } from '../ui/OsTabs';
import { Section } from '../ui/Section';
import { StepItem } from './StepItem';

interface SetupSectionProps {
  selection: Selection;
  plan: SetupPlan;
  prompt: string;
  agentLabels: string[];
  onSetOs: (os: OsId) => void;
}

/** "Your setup": the copy-the-prompt path, then every step by hand with OS tabs. */
export function SetupSection({ selection, plan, prompt, agentLabels, onSetOs }: SetupSectionProps) {
  const panelId = 'manual-steps-panel';
  const agentText = agentLabels.length > 0 ? agentLabels.join(', ') : 'your coding agent';
  return (
    <Section
      id="your-setup"
      eyebrow="Your setup"
      // COPY: owner review
      lead="One prompt."
      gradient="Or every step yourself."
      intro={<p className="m-0">Both paths end in the same place. The prompt is faster; the steps show you what happens.</p>}
    >
      <div id="prompt" className="ccc-hairline-card scroll-mt-6 flex flex-col gap-4 p-5 sm:p-6">
        <h3 className="m-0 text-body font-semibold text-ink">Path one: copy the prompt</h3>
        <p className="m-0 max-w-measure text-ui leading-[1.65] text-ink-body">
          Open {agentText} in an empty folder, paste the prompt and let it work. It stops and asks when a step needs
          you.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <CopyButton variant="primary" label="Copy the prompt" getText={() => prompt} />
          <MetaRow items={[`${plan.steps.length} steps`, OS_LABEL[selection.os]]} />
        </div>
      </div>

      <div className="mt-14">
        <h3 id="manual-heading" className="m-0 text-body font-semibold text-ink">
          Path two: every step yourself
        </h3>
        <p className="mt-2 mb-5 max-w-measure text-ui leading-[1.65] text-ink-body">
          Run them in this order. Each command has a copy button and a link to the official docs.
        </p>
        <OsTabs value={selection.os} onChange={onSetOs} idBase="manual" panelId={panelId} label="Operating system for the steps" />
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={tabId('manual', selection.os)}
          className="mt-6"
        >
          <ol key={selection.os} className="ccc-fade m-0 flex list-none flex-col gap-8 p-0">
            {plan.steps.map((step, i) => (
              <StepItem key={step.id} step={step} index={i} selection={selection} os={selection.os} />
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
