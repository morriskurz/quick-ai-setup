import { agents, extras, goals } from '../content';
import type { AgentId, ExtraId, GoalId, OsId, Selection } from '../content/types';

export const STORAGE_KEY = 'quick-ai-setup:selection';
export const STORAGE_VERSION = 1;

export const OS_IDS: readonly OsId[] = ['windows', 'macos', 'linux'];

interface StoredSelection {
  v: number;
  selection: Selection;
}

/**
 * Best guess at the reader's desktop OS. Phones map to the computer they most
 * likely set up from: iOS → macOS, Android → Windows. Unknown → Windows.
 */
export function detectOs(nav: Pick<Navigator, 'platform' | 'userAgent'> & { userAgentData?: { platform?: string } }): OsId {
  const hint = `${nav.userAgentData?.platform ?? ''} ${nav.platform ?? ''} ${nav.userAgent ?? ''}`.toLowerCase();
  if (/android/.test(hint)) return 'windows';
  if (/mac|iphone|ipad|ios/.test(hint)) return 'macos';
  if (/win/.test(hint)) return 'windows';
  if (/linux|x11|cros|bsd/.test(hint)) return 'linux';
  return 'windows';
}

export function recommendedAgents(): AgentId[] {
  const rec = agents.filter((a) => a.recommended).map((a) => a.id);
  if (rec.length > 0) return rec;
  return agents.length > 0 ? [agents[0].id] : [];
}

export function defaultSelection(os: OsId): Selection {
  return { agents: recommendedAgents(), goals: [], extras: [], os };
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

/**
 * Parse whatever is in storage into a valid Selection, or null. Unknown ids
 * (content changed since the visit) are dropped; order follows the content
 * lists so the output is stable. An empty agent list falls back to the
 * recommended agent.
 */
export function parseStoredSelection(raw: string | null, fallbackOs: OsId): Selection | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  const stored = data as Partial<StoredSelection>;
  if (stored.v !== STORAGE_VERSION || !stored.selection || typeof stored.selection !== 'object') return null;
  const s = stored.selection as unknown as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, known: readonly T[]): T[] =>
    isStringArray(value) ? known.filter((id) => value.includes(id)) : [];

  const agentIds = pick<AgentId>(s.agents, agents.map((a) => a.id));
  const goalIds = pick<GoalId>(s.goals, goals.map((g) => g.id));
  const extraIds = pick<ExtraId>(s.extras, extras.map((e) => e.id));
  const os = OS_IDS.includes(s.os as OsId) ? (s.os as OsId) : fallbackOs;

  return {
    agents: agentIds.length > 0 ? agentIds : recommendedAgents(),
    goals: goalIds,
    extras: extraIds,
    os,
  };
}

export function serializeSelection(selection: Selection): string {
  const payload: StoredSelection = { v: STORAGE_VERSION, selection };
  return JSON.stringify(payload);
}
