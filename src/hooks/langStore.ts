import type { Lang } from '../content/types';

/** The reader's language choice. Kept apart from the Selection storage on purpose. */
export const LANG_STORAGE_KEY = 'quick-ai-setup:lang';

/** German when any preferred browser language is German (de, de-DE, de-AT, de-CH …), else English. */
export function detectLang(nav: { languages?: readonly string[]; language?: string }): Lang {
  const list = nav.languages?.length ? nav.languages : nav.language ? [nav.language] : [];
  return list.some((l) => /^de(-|$)/i.test(l)) ? 'de' : 'en';
}

export function parseStoredLang(raw: string | null): Lang | null {
  return raw === 'en' || raw === 'de' ? raw : null;
}
