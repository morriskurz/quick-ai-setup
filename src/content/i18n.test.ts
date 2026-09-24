import { describe, expect, it } from 'vitest';
import { CONSULTING } from '../components/consulting';
import { splitTitle } from '../components/ui/headline';
import { buildAgentPrompt, buildAgentsMd, PROMPT_EN } from '../lib/generate';
import { heroCopy, sectionCopy, securityCopy, startCopy } from './copy';
import { consultingDe, heroCopyDe, sectionCopyDe, securityCopyDe, startCopyDe, uiCopyDe } from './de/copy';
import { PROMPT_DE } from './de/prompt';
import { PROJECT_EMPTY_DE, PROJECT_FRAGMENTS_DE, PROJECT_HEADER_DE } from './de/rules';
import { agentsDe, extrasDe, goalsDe, notesDe, stepsDe } from './de/steps';
import { ADMIN_NOTE_PREFIX, ADMIN_NOTE_PREFIX_DE } from './helpers';
import { agents, extras, goals, steps } from './index';
import { contentFor, localizeStep } from './i18n';
import type { AgentId, GoalId, Selection } from './types';
import { uiCopy } from './ui';

const ALL_AGENTS: AgentId[] = ['claude-code', 'codex', 'opencode'];
const ALL_GOALS: GoalId[] = goals.map((g) => g.id);

/** Sample arguments for chrome functions, so their output is checked like any string. */
const SAMPLE_ARGS = [3, 2, 1] as const;

/** Every string in a nested copy object; functions are called with sample arguments. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value === 'function') {
    const fn = value as (...a: unknown[]) => unknown;
    return strings(fn(...SAMPLE_ARGS.slice(0, fn.length).map((n, i) => (i === 0 && fn.length === 1 ? 'X' : n))));
  }
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

/**
 * Paths where the German object's shape differs from the English one: missing keys, extra
 * keys, empty strings, or a function where a string belongs.
 */
function shapeGaps(en: unknown, de: unknown, path = ''): string[] {
  if (typeof en === 'string') return typeof de === 'string' && de.trim() ? [] : [path || '(root)'];
  if (typeof en === 'function') return typeof de === 'function' ? [] : [path];
  if (Array.isArray(en)) {
    if (!Array.isArray(de) || de.length !== en.length) return [path];
    return en.flatMap((v, i) => shapeGaps(v, de[i], `${path}[${i}]`));
  }
  if (en && typeof en === 'object') {
    if (!de || typeof de !== 'object') return [path];
    const d = de as Record<string, unknown>;
    const e = en as Record<string, unknown>;
    const extra = Object.keys(d)
      .filter((k) => !(k in e))
      .map((k) => `${path}.${k} (extra)`);
    return [...Object.keys(e).flatMap((k) => shapeGaps(e[k], d[k], `${path}.${k}`)), ...extra];
  }
  return [];
}

/** Every English command note, across all steps and systems. */
const englishNotes = [
  ...new Set(
    Object.values(steps).flatMap((s) =>
      Object.values(s.commands ?? {}).flatMap((cmds) => cmds.flatMap((c) => (c.note ? [c.note] : []))),
    ),
  ),
];

describe('German dictionary is complete (no silent English fallback)', () => {
  it('every step has German title, why, instructions and warning where English has them', () => {
    const missing: string[] = [];
    for (const [id, step] of Object.entries(steps)) {
      const de = stepsDe[id];
      if (!de) {
        missing.push(id);
        continue;
      }
      if (!de.title?.trim()) missing.push(`${id}.title`);
      if (!de.why?.trim()) missing.push(`${id}.why`);
      if (step.human && !de.instructions?.trim()) missing.push(`${id}.instructions`);
      if (!step.human && de.instructions) missing.push(`${id}.instructions (extra)`);
      if (step.warning && !de.warning?.trim()) missing.push(`${id}.warning`);
      if (!step.warning && de.warning) missing.push(`${id}.warning (extra)`);
    }
    for (const id of Object.keys(stepsDe)) if (!steps[id]) missing.push(`${id} (unknown step)`);
    expect(missing).toEqual([]);
  });

  it('every command note has a German version, and administrator notes keep their marker', () => {
    expect(englishNotes.filter((n) => !notesDe[n])).toEqual([]);
    expect(Object.keys(notesDe).filter((n) => !englishNotes.includes(n))).toEqual([]);
    for (const n of englishNotes) {
      expect(notesDe[n].startsWith(ADMIN_NOTE_PREFIX_DE), n).toBe(n.startsWith(ADMIN_NOTE_PREFIX));
    }
  });

  it('every agent, goal and extra has German text', () => {
    const missing = [
      ...agents.filter((a) => !agentsDe[a.id]?.summary?.trim()).map((a) => `agent ${a.id}`),
      ...goals.filter((g) => !goalsDe[g.id]?.label?.trim() || !goalsDe[g.id]?.summary?.trim()).map((g) => `goal ${g.id}`),
      ...extras
        .filter((x) => !extrasDe[x.id]?.label?.trim() || !extrasDe[x.id]?.summary?.trim() || !extrasDe[x.id]?.warning?.trim())
        .map((x) => `extra ${x.id}`),
      ...ALL_GOALS.filter((g) => !PROJECT_FRAGMENTS_DE[g]).map((g) => `project fragment ${g}`),
    ];
    expect(missing).toEqual([]);
  });

  it('every copy and chrome key has a German entry', () => {
    const { permissionModes: _en, ...securityEn } = securityCopy;
    const { permissionModes: modesDe, ...securityRest } = securityCopyDe;
    const consultingTextEn = {
      lead: CONSULTING.lead,
      gradient: CONSULTING.gradient,
      body: CONSULTING.body,
      photoAlt: CONSULTING.photoAlt,
      role: CONSULTING.role,
      bio: CONSULTING.bio,
      cta: CONSULTING.cta,
    };
    const gaps = [
      ...shapeGaps(heroCopy, heroCopyDe, 'heroCopy'),
      ...shapeGaps(sectionCopy, sectionCopyDe, 'sectionCopy'),
      ...shapeGaps(securityEn, securityRest, 'securityCopy'),
      ...securityCopy.permissionModes.filter((m) => !modesDe[m.agent]?.trim()).map((m) => `securityCopy.permissionModes.${m.agent}`),
      ...shapeGaps(startCopy, startCopyDe, 'startCopy'),
      ...shapeGaps(uiCopy, uiCopyDe, 'ui'),
      ...shapeGaps(consultingTextEn, consultingDe, 'consulting'),
      // keepRulesVerbatim exists only where the rules' language differs from the prompt's.
      ...shapeGaps(PROMPT_EN, { ...PROMPT_DE, keepRulesVerbatim: undefined }, 'prompt').filter((g) => g !== 'prompt.keepRulesVerbatim (extra)'),
    ];
    expect(gaps).toEqual([]);
  });

  it('localizeStep keeps commands, URLs and ids and swaps only prose', () => {
    for (const step of Object.values(steps)) {
      const de = localizeStep(step, 'de');
      expect(de.id).toBe(step.id);
      expect(de.docsUrl).toBe(step.docsUrl);
      expect(de.human?.url).toBe(step.human?.url);
      expect(de.agents).toBe(step.agents);
      for (const [os, cmds] of Object.entries(step.commands ?? {})) {
        expect(de.commands?.[os as keyof typeof de.commands]?.map((c) => c.run)).toEqual(cmds.map((c) => c.run));
      }
      expect(de.title, step.id).not.toBe(step.title);
    }
  });
});

/** Informal "du" and the corporate "wir" (the owner speaks as "ich"), as whole words only. */
const FORBIDDEN = /(?<![\p{L}\p{N}_-])(du|dich|dir|dein\p{L}*|euch|euer|eure\p{L}*|wir|uns|unser\p{L}*)(?![\p{L}\p{N}_-])/iu;

const withoutFences = (text: string) => text.replace(/~~~[\s\S]*?~~~/g, '');

describe('German voice', () => {
  const fullSelection = (os: Selection['os']): Selection => ({ os, agents: ALL_AGENTS, goals: ALL_GOALS, extras: ['rtk', 'caveman'] });
  const germanTexts: string[] = [
    ...strings(stepsDe),
    ...strings(notesDe),
    ...strings(agentsDe),
    ...strings(goalsDe),
    ...strings(extrasDe),
    ...strings(heroCopyDe),
    ...strings(sectionCopyDe),
    ...strings(securityCopyDe),
    ...strings(startCopyDe),
    ...strings(uiCopyDe),
    ...strings(consultingDe),
    PROJECT_HEADER_DE,
    PROJECT_EMPTY_DE,
    ...ALL_GOALS.map((g) => PROJECT_FRAGMENTS_DE[g](fullSelection('linux'))),
    ...(['windows', 'macos', 'linux'] as const).map((os) => withoutFences(buildAgentPrompt(fullSelection(os), 'de'))),
  ];

  it('the regex catches what it should and spares look-alikes', () => {
    for (const bad of ['Hast du Zeit?', 'Wir helfen', 'für dich', 'Deine Daten', 'bei uns', 'unsere Kunden']) {
      expect(bad).toMatch(FORBIDDEN);
    }
    for (const ok of ['Durchlauf', 'Dürfen', 'direkt', 'Dienst', 'Dirigent', 'winget', 'Wirkung', 'dual', 'unsicher']) {
      expect(ok).not.toMatch(FORBIDDEN);
    }
  });

  it('never uses du/dich/dir/dein or wir/uns/unser', () => {
    const hits = germanTexts.flatMap((t) => {
      const m = FORBIDDEN.exec(t);
      return m ? [`"${m[0]}" in: ${t.slice(Math.max(0, m.index - 40), m.index + 40)}`] : [];
    });
    expect(hits).toEqual([]);
  });

  it('section headlines are two sentences with full stops, never a question (brand rule)', () => {
    const c = contentFor('de');
    const titles = [
      c.sectionCopy.agent.title,
      c.sectionCopy.goals.title,
      c.sectionCopy.extras.title,
      c.sectionCopy.setup.title,
      c.sectionCopy.houseRules.title,
      c.securityCopy.title,
      c.startCopy.title,
      `${consultingDe.lead} ${consultingDe.gradient}`,
      c.heroCopy.headline.join(' '),
    ];
    for (const t of titles) {
      expect(t, t).not.toContain('?');
      expect(t, t).not.toContain('!');
      const { lead, gradient } = splitTitle(t);
      expect(lead.endsWith('.'), t).toBe(true);
      expect(gradient?.endsWith('.'), t).toBe(true);
    }
    expect(c.sectionCopy.verify.title.endsWith('.')).toBe(true);
  });

  it('keeps the owner’s global house rules English and translates the project template', () => {
    const s = fullSelection('macos');
    expect(buildAgentsMd(s, 'de').global).toBe(buildAgentsMd(s).global);
    expect(buildAgentsMd(s, 'de').project.startsWith('# Projektregeln')).toBe(true);
    expect(buildAgentsMd({ ...s, goals: [] }, 'de').project).toContain('## Arbeiten in diesem Projekt');
  });
});
