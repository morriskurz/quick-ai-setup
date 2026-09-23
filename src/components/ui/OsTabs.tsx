import { useRef, type KeyboardEvent } from 'react';
import type { OsId } from '../../content/types';
import { OS_IDS } from '../../hooks/selectionStore';
import { OS_LABEL, tabId } from './os';

interface OsTabsProps {
  value: OsId;
  onChange: (os: OsId) => void;
  /** Unique prefix for tab ids. */
  idBase: string;
  panelId: string;
  label: string;
}

/**
 * Accessible tablist (automatic activation): arrow keys, Home and End move
 * focus and select; only the selected tab is in the tab order.
 */
export function OsTabs({ value, onChange, idBase, panelId, label }: OsTabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % OS_IDS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + OS_IDS.length) % OS_IDS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = OS_IDS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(OS_IDS[next]);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="ccc-segment">
      {OS_IDS.map((os, i) => {
        const selected = os === value;
        return (
          <button
            key={os}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={tabId(idBase, os)}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            className="ccc-segment__item"
            onClick={() => onChange(os)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {OS_LABEL[os]}
          </button>
        );
      })}
    </div>
  );
}
