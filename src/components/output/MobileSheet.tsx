import { sectionCopy } from '../../content';
import { useEffect, useId, useState } from 'react';
import { CopyButton } from '../ui/CopyButton';
import { PromptView } from './PromptView';

interface MobileSheetProps {
  prompt: string;
  stepCount: number;
}

/**
 * Below 1024px: a bar pinned to the bottom with the copy button; the toggle
 * expands it upward to show the full prompt. Escape closes it. Collapsed
 * content is inert so it is skipped by keyboard and screen readers.
 */
export function MobileSheet({ prompt, stepCount }: MobileSheetProps) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <section
      aria-label="Your prompt"
      className="ccc-sheet fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-page lg:hidden"
    >
      <div id={bodyId} className="ccc-sheet__body" data-open={open || undefined} inert={!open}>
        <div className="min-h-0 overflow-hidden">
          <div className="px-gutter pt-4">
            <PromptView text={prompt} label="Generated prompt" className="max-h-[min(58dvh,520px)] pb-2" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-gutter pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((o) => !o)}
          className="ccc-sheet__toggle flex min-w-0 flex-1 flex-col items-start gap-0.5 border-0 bg-transparent p-0 text-left"
        >
          <span key={stepCount} className="ccc-fade ccc-meta">
            {stepCount} {stepCount === 1 ? 'step' : 'steps'}
          </span>
          <span className="text-nav font-medium">{open ? 'Hide the prompt' : 'Show the prompt'}</span>
        </button>
        <CopyButton variant="primary" label={sectionCopy.setup.copyPromptCta} getText={() => prompt} className="flex-none px-5" />
      </div>
    </section>
  );
}
