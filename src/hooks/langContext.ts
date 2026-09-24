import { createContext, useContext } from 'react';
import { contentFor, type ContentBundle } from '../content/i18n';
import type { Lang } from '../content/types';

/** Current page language; App provides it. */
export const LangContext = createContext<Lang>('en');

/** All page copy and chrome in the current language. */
export function useContent(): ContentBundle {
  return contentFor(useContext(LangContext));
}
