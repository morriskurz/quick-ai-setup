import { useCallback, useEffect, useState } from 'react';
import type { AgentId, ExtraId, GoalId, OsId, Selection } from '../content/types';
import { STORAGE_KEY, defaultSelection, detectOs, parseStoredSelection, serializeSelection } from './selectionStore';

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(value: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage unavailable (private mode, blocked, quota): the page works without it.
  }
}

function initialSelection(): Selection {
  const os = typeof navigator === 'undefined' ? 'windows' : detectOs(navigator);
  return parseStoredSelection(readStorage(), os) ?? defaultSelection(os);
}

const toggle = <T,>(list: T[], id: T): T[] => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

/** The reader's ticks, persisted to localStorage (versioned, validated on load). */
export function useSelection() {
  const [selection, setSelection] = useState<Selection>(initialSelection);

  useEffect(() => {
    writeStorage(serializeSelection(selection));
  }, [selection]);

  const toggleAgent = useCallback((id: AgentId) => setSelection((s) => ({ ...s, agents: toggle(s.agents, id) })), []);
  const toggleGoal = useCallback((id: GoalId) => setSelection((s) => ({ ...s, goals: toggle(s.goals, id) })), []);
  const toggleExtra = useCallback((id: ExtraId) => setSelection((s) => ({ ...s, extras: toggle(s.extras, id) })), []);
  const setOs = useCallback((os: OsId) => setSelection((s) => (s.os === os ? s : { ...s, os })), []);

  return { selection, toggleAgent, toggleGoal, toggleExtra, setOs };
}
