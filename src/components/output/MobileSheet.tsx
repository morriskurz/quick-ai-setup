import { useContent } from '../../hooks/langContext';
import { useEffect, useId, useState } from 'react';
import { CopyButton } from '../ui/CopyButton';
import { goToGetStarted } from '../ui/goToGetStarted';
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
  const { lang, sectionCopy, ui } = useContent();
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
      aria-label={ui.output.heading}
      className="ccc-sheet fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-page lg:hidden"
    >
      <div id={bodyId} className="ccc-sheet__body" data-open={open || undefined} inert={!open}>
        <div className="min-h-0 overflow-hidden">
          <div className="px-gutter pt-4">
            <PromptView key={lang} text={prompt} label={ui.output.promptLabel} className="max-h-[min(58dvh,520px)] pb-2" />
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
            {ui.steps(stepCount)}
          </span>
          <span className="text-nav font-medium">{open ? ui.output.hide : ui.output.show}</span>
        </button>
        <CopyButton variant="primary" label={sectionCopy.setup.copyPromptCta} getText={() => prompt}
          onCopied={() => {
            setOpen(false);
            goToGetStarted();
          }}
          className="flex-none px-5"
        />
      </div>
    </section>
  );
}
