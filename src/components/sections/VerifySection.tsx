import { sectionCopy } from '../../content';
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

const copy = sectionCopy.verify;

export function VerifySection({ selection, script, onSetOs }: VerifySectionProps) {
  const panelId = 'verify-panel';
  const os = selection.os;
  return (
    <Section id="verify" eyebrow={copy.eyebrow} title={copy.title} intro={<p className="m-0">{copy.intro}</p>}>
      <OsTabs value={os} onChange={onSetOs} idBase="verify" panelId={panelId} label="Operating system for the verify script" />
      <div id={panelId} role="tabpanel" aria-labelledby={tabId('verify', os)} className="mt-6">
        <div key={os} className="ccc-fade">
          <CodeBlock
            code={script}
            label={`${OS_LABEL[os]} · ${OS_SHELL[os]}`}
            context="verify script"
            copyLabel={copy.copyCta}
          />
        </div>
      </div>
    </Section>
  );
}
