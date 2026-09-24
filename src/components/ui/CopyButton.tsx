import { useContent } from '../../hooks/langContext';
import { useCopy } from '../../hooks/useCopy';
import { Button, type ButtonVariant } from '../ds';

interface CopyButtonProps {
  /** Text to copy, read at click time. */
  getText: () => string;
  label: string;
  /** Accessible name when the visible label alone is ambiguous (must start with the visible label). */
  ariaLabel?: string;
  variant?: ButtonVariant;
  small?: boolean;
  className?: string;
  /** Runs after a successful copy. */
  onCopied?: () => void;
}

/**
 * Copy button. Swaps its label to "Copied" for ~1.6s (no icon), and announces
 * the result through a polite live region.
 */
export function CopyButton({ getText, label, ariaLabel, variant = 'ghost', small = false, className, onCopied }: CopyButtonProps) {
  const { ui } = useContent();
  const { copied, failed, copy } = useCopy();
  const visible = copied ? ui.copy.copied : failed ? ui.copy.failed : label;
  return (
    <>
      <Button
        variant={variant}
        small={small}
        className={className}
        aria-label={copied || failed ? undefined : ariaLabel}
        onClick={() => void copy(getText()).then((ok) => ok && onCopied?.())}
      >
        {visible}
      </Button>
      <span role="status" aria-live="polite" className="ccc-visually-hidden">
        {copied ? ui.copy.copiedStatus : failed ? ui.copy.failedStatus : ''}
      </span>
    </>
  );
}
