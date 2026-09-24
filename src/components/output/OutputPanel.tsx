import { useContent } from '../../hooks/langContext';
import { EyebrowLabel, MetaRow } from '../ds';
import { CopyButton } from '../ui/CopyButton';
import { goToGetStarted } from '../ui/goToGetStarted';
import { PromptView } from './PromptView';

interface OutputPanelProps {
  prompt: string;
  meta: string[];
}

/** Desktop: sticky live output in the right column. */
export function OutputPanel({ prompt, meta }: OutputPanelProps) {
  const { lang, sectionCopy, ui } = useContent();
  return (
    <section
      aria-labelledby="output-heading"
      className="ccc-hairline-card flex max-h-[calc(100dvh-48px)] flex-col gap-4 p-5"
    >
      <div className="flex flex-col gap-2.5">
        <EyebrowLabel as="h2" id="output-heading" className="m-0 font-normal">
          {ui.output.heading}
        </EyebrowLabel>
        <MetaRow items={meta} />
      </div>
      <PromptView
        key={lang}
        text={prompt}
        label={ui.output.promptLabel}
        className="min-h-[160px] flex-1 border-y border-hairline py-4"
      />
      <CopyButton variant="primary" label={sectionCopy.setup.copyPromptCta} getText={() => prompt} onCopied={goToGetStarted} className="w-full" />
    </section>
  );
}
