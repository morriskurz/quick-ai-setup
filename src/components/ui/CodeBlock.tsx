import { CopyButton } from './CopyButton';

interface CodeBlockProps {
  code: string;
  /** Mono label in the header, e.g. "PowerShell" or "Terminal". */
  label: string;
  /** Used in accessible names: "Copy command for Install Git". */
  context: string;
  docsUrl?: string;
  /** Wrap long lines (markdown files); commands scroll horizontally instead. */
  wrap?: boolean;
  copyLabel?: string;
  className?: string;
}

/** Hairline mono block with a Docs link and a copy button in its header. */
export function CodeBlock({ code, label, context, docsUrl, wrap = false, copyLabel = 'Copy', className = '' }: CodeBlockProps) {
  return (
    <div className={`ccc-code ${className}`}>
      <div className="ccc-code__head">
        <span className="ccc-meta truncate">{label}</span>
        <div className="flex flex-none items-center gap-4">
          {docsUrl && (
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ccc-link text-nav"
              aria-label={`Docs for ${context} (opens in a new tab)`}
            >
              Docs
            </a>
          )}
          <CopyButton small getText={() => code} label={copyLabel} ariaLabel={`${copyLabel} ${context}`} />
        </div>
      </div>
      <pre className={`ccc-code__pre ccc-scroll ${wrap ? 'ccc-code__pre--wrap' : ''}`} tabIndex={0} aria-label={context}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
