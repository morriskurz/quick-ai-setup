import { EyebrowLabel, MetaRow } from '../ds';
import { CopyButton } from '../ui/CopyButton';
import { PromptView } from './PromptView';

interface OutputPanelProps {
  prompt: string;
  meta: string[];
}

/** Desktop: sticky live output in the right column. */
export function OutputPanel({ prompt, meta }: OutputPanelProps) {
  return (
    <section
      aria-labelledby="output-heading"
      className="ccc-hairline-card flex max-h-[calc(100dvh-48px)] flex-col gap-4 p-5"
    >
      <div className="flex flex-col gap-2.5">
        <EyebrowLabel as="h2" id="output-heading" className="m-0 font-normal">
          Your prompt
        </EyebrowLabel>
        <MetaRow items={meta} />
      </div>
      <PromptView
        text={prompt}
        label="Generated prompt"
        className="min-h-[160px] flex-1 border-y border-hairline py-4"
      />
      <CopyButton variant="primary" label="Copy the prompt" getText={() => prompt} className="w-full" />
      <p className="m-0 text-meta leading-[1.6] text-ink-muted">Updates as you tick. Paste it into your agent.</p>
    </section>
  );
}
