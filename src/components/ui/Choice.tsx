import type { ReactNode } from 'react';

interface ChoiceProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  summary?: string;
  /** Short mono tag beside the label, e.g. "recommended". */
  tag?: string;
  /** Shown under the summary, always visible (extras carry one). */
  warning?: ReactNode;
  /** Mono label before the warning ("Note"). */
  warningLabel?: string;
}

/**
 * Checkbox row. A real <input type="checkbox"> stays in the DOM, visually
 * hidden; the hairline square is decoration driven by :checked.
 */
export function Choice({ id, checked, onChange, label, summary, tag, warning, warningLabel = 'Note' }: ChoiceProps) {
  const summaryId = summary ? `${id}-summary` : undefined;
  const warningId = warning ? `${id}-warning` : undefined;
  const describedBy = [summaryId, warningId].filter(Boolean).join(' ') || undefined;
  return (
    <label htmlFor={id} className="ccc-choice">
      <input
        id={id}
        type="checkbox"
        className="ccc-visually-hidden"
        checked={checked}
        onChange={onChange}
        aria-describedby={describedBy}
      />
      <span aria-hidden="true" className="ccc-check" />
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-ui font-semibold text-ink">{label}</span>
          {tag && <span className="font-mono text-meta text-cyan">{tag}</span>}
        </span>
        {summary && (
          <span id={summaryId} className="text-nav text-ink-body">
            {summary}
          </span>
        )}
        {warning && (
          <span id={warningId} className="mt-1 border-t border-hairline pt-2.5 text-nav text-ink-body">
            <span className="font-mono text-meta text-cyan">{warningLabel} </span>
            {warning}
          </span>
        )}
      </span>
    </label>
  );
}
