import { useCallback, useEffect, useState } from 'react';
import { contentFor } from '../content/i18n';
import type { Lang } from '../content/types';
import { detectLang, LANG_STORAGE_KEY, parseStoredLang } from './langStore';

function readStoredLang(): Lang | null {
  try {
    return parseStoredLang(window.localStorage.getItem(LANG_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStoredLang(lang: Lang) {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Storage unavailable (private mode, blocked, quota): the choice lasts for this visit.
  }
}

function initialLang(): Lang {
  return readStoredLang() ?? (typeof navigator === 'undefined' ? 'en' : detectLang(navigator));
}

/**
 * Page language: the stored choice, else the browser's languages. Only an explicit choice is
 * stored, so a visitor who never picks keeps following the browser. Keeps <html lang> and
 * the document title in step.
 */
export function useLang() {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = contentFor(lang).ui.docTitle;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    writeStoredLang(next);
    setLangState(next);
  }, []);

  return { lang, setLang };
}
