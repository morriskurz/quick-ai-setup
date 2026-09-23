import { useCallback, useEffect, useRef, useState } from 'react';

function copyWithExecCommand(text: string): boolean {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  Object.assign(ta.style, { position: 'fixed', top: '0', left: '0', opacity: '0', pointerEvents: 'none' });
  document.body.appendChild(ta);
  const selection = document.getSelection();
  const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  ta.remove();
  if (previous && selection) {
    selection.removeAllRanges();
    selection.addRange(previous);
  }
  return ok;
}

/** Copy text to the clipboard: async Clipboard API first, execCommand as the fallback. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or unsupported: fall through.
  }
  return copyWithExecCommand(text);
}

export const COPIED_MS = 1600;

/** `copied` is true for ~1.6s after a successful copy. */
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async (text: string) => {
    const ok = await copyText(text);
    window.clearTimeout(timer.current);
    setCopied(ok);
    setFailed(!ok);
    timer.current = window.setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, COPIED_MS);
    return ok;
  }, []);

  return { copied, failed, copy };
}
