import { sectionCopy } from '../../content';
import type { OsId, Selection, SetupPlan } from '../../content/types';
import { MetaRow } from '../ds';
import { CopyButton } from '../ui/CopyButton';
import { goToGetStarted } from '../ui/goToGetStarted';
import { OS_LABEL, tabId } from '../ui/os';
import { OsTabs } from '../ui/OsTabs';
import { Section } from '../ui/Section';
import { StepItem } from './StepItem';

interface SetupSectionProps {
  selection: Selection;
  plan: SetupPlan;
  prompt: string;
  verifyScript: string;
  onSetOs: (os: OsId) => void;
}

const copy = sectionCopy.setup;

/** "Your setup": the copy-the-prompt path, then every step by hand with OS tabs. */
export function SetupSection({ selection, plan, prompt, verifyScript, onSetOs }: SetupSectionProps) {
  const panelId = 'manual-steps-panel';
  return (
    <Section id="your-setup" title={copy.title} intro={<p className="m-0">{copy.intro}</p>}>
      <div id="prompt" className="ccc-hairline-card scroll-mt-6 flex flex-col gap-4 p-5 sm:p-6">
        {/* COPY: owner review — sub-headings */}
        <h3 className="m-0 text-body font-semibold text-ink">Path one: copy the prompt</h3>
        <p className="m-0 max-w-measure text-ui leading-[1.65] text-ink-body">{sectionCopy.agent.installNote}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <CopyButton variant="primary" label={copy.copyPromptCta} getText={() => prompt} onCopied={goToGetStarted} />
          <MetaRow items={[`${plan.steps.length} steps`, OS_LABEL[selection.os]]} />
        </div>
      </div>

      <div className="mt-14">
        <h3 id="manual-heading" className="m-0 text-body font-semibold text-ink">
          Path two: every step yourself
        </h3>
        <div className="mt-5">
          <OsTabs value={selection.os} onChange={onSetOs} idBase="manual" panelId={panelId} label="Operating system for the steps" />
        </div>
        <div id={panelId} role="tabpanel" aria-labelledby={tabId('manual', selection.os)} className="mt-6">
          <ol key={selection.os} className="ccc-fade m-0 flex list-none flex-col gap-8 p-0">
            {plan.steps.map((step, i) => (
              <StepItem
                key={step.id}
                step={step}
                index={i}
                selection={selection}
                os={selection.os}
                verifyScript={verifyScript}
              />
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
