import { useContent } from '../../hooks/langContext';
import type { OsId, Selection } from '../../content/types';
import { CodeBlock } from '../ui/CodeBlock';
import { OS_LABEL, OS_SHELL, tabId } from '../ui/os';
import { OsTabs } from '../ui/OsTabs';
import { Section } from '../ui/Section';

interface VerifySectionProps {
  selection: Selection;
  script: string;
  onSetOs: (os: OsId) => void;
}

export function VerifySection({ selection, script, onSetOs }: VerifySectionProps) {
  const { sectionCopy, ui } = useContent();
  const copy = sectionCopy.verify;
  const panelId = 'verify-panel';
  const os = selection.os;
  return (
    <Section id="verify" title={copy.title} intro={<p className="m-0">{copy.intro}</p>}>
      <OsTabs value={os} onChange={onSetOs} idBase="verify" panelId={panelId} label={ui.verify.osTabs} />
      <div id={panelId} role="tabpanel" aria-labelledby={tabId('verify', os)} className="mt-6">
        <div key={os} className="ccc-fade">
          <CodeBlock
            code={script}
            label={`${OS_LABEL[os]} · ${OS_SHELL[os]}`}
            context={ui.verify.context}
            copyLabel={copy.copyCta}
          />
        </div>
      </div>
    </Section>
  );
}
