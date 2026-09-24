// Language accessors. English is the source of truth in the existing content files; German
// comes from ./de, keyed by the same ids. Anything missing in German falls back to English,
// and src/content/i18n.test.ts fails on every such gap, so the fallback never shows in practice.

import { heroCopy, sectionCopy, securityCopy, startCopy } from './copy';
import { consultingDe, heroCopyDe, sectionCopyDe, securityCopyDe, startCopyDe, uiCopyDe, type Widen } from './de/copy';
import { agentsDe, extrasDe, goalsDe, notesDe, stepsDe } from './de/steps';
import { agents } from './steps/agents';
import { extras } from './steps/extras';
import { goals } from './steps/goals';
import type { AgentOption, Command, Extra, Goal, Lang, OsId, Step } from './types';
import { uiCopy, type UiCopy } from './ui';

export const LANGS: readonly Lang[] = ['en', 'de'];

export { consultingDe };

/** One command note in the given language. */
export function localizeNote(note: string | undefined, lang: Lang): string | undefined {
  if (!note || lang === 'en') return note;
  return notesDe[note] ?? note;
}

const stepCache = new Map<Step, Step>();

/** A step with its prose in the given language; commands, URLs and ids are the English ones. */
export function localizeStep(step: Step, lang: Lang): Step {
  if (lang === 'en') return step;
  const cached = stepCache.get(step);
  if (cached) return cached;
  const de = stepsDe[step.id];
  const commands = step.commands
    ? (Object.fromEntries(
        Object.entries(step.commands).map(([os, cmds]) => [
          os,
          cmds.map((c): Command => (c.note ? { ...c, note: localizeNote(c.note, 'de') } : c)),
        ]),
      ) as Partial<Record<OsId, Command[]>>)
    : undefined;
  const out: Step = {
    ...step,
    title: de?.title ?? step.title,
    why: de?.why ?? step.why,
    ...(commands ? { commands } : {}),
    ...(step.human ? { human: { ...step.human, instructions: de?.instructions ?? step.human.instructions } } : {}),
    ...(step.warning ? { warning: de?.warning ?? step.warning } : {}),
  };
  stepCache.set(step, out);
  return out;
}

export interface ContentBundle {
  lang: Lang;
  agents: AgentOption[];
  goals: Goal[];
  extras: Extra[];
  heroCopy: Widen<typeof heroCopy>;
  sectionCopy: Widen<typeof sectionCopy>;
  securityCopy: Omit<Widen<typeof securityCopy>, 'permissionModes'> & {
    permissionModes: readonly { agent: string; label: string; body: string; url: string }[];
  };
  startCopy: Widen<typeof startCopy>;
  ui: UiCopy;
}

const en: ContentBundle = { lang: 'en', agents, goals, extras, heroCopy, sectionCopy, securityCopy, startCopy, ui: uiCopy };

const de: ContentBundle = {
  lang: 'de',
  agents: agents.map((a) => ({ ...a, summary: agentsDe[a.id]?.summary ?? a.summary })),
  goals: goals.map((g) => ({ ...g, ...goalsDe[g.id] })),
  extras: extras.map((x) => ({ ...x, ...extrasDe[x.id] })),
  heroCopy: heroCopyDe,
  sectionCopy: sectionCopyDe,
  securityCopy: {
    ...securityCopyDe,
    permissionModes: securityCopy.permissionModes.map((m) => ({
      ...m,
      body: securityCopyDe.permissionModes[m.agent as keyof typeof securityCopyDe.permissionModes] ?? m.body,
    })),
  },
  startCopy: startCopyDe,
  ui: uiCopyDe,
};

/** Everything the page and the generator need in one language. */
export function contentFor(lang: Lang): ContentBundle {
  return lang === 'de' ? de : en;
}
