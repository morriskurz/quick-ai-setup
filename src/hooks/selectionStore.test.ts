import { describe, expect, it } from 'vitest';
import { agents, goals } from '../content';
import { detectOs, parseStoredSelection, recommendedAgents, serializeSelection, STORAGE_VERSION } from './selectionStore';

describe('parseStoredSelection', () => {
  it('returns null for empty, malformed or wrong-version data', () => {
    expect(parseStoredSelection(null, 'linux')).toBeNull();
    expect(parseStoredSelection('{not json', 'linux')).toBeNull();
    expect(parseStoredSelection(JSON.stringify({ v: STORAGE_VERSION + 1, selection: {} }), 'linux')).toBeNull();
  });

  it('round-trips a valid selection', () => {
    const sel = { agents: [agents[0].id], goals: [goals[0].id], extras: [], os: 'macos' as const };
    expect(parseStoredSelection(serializeSelection(sel), 'linux')).toEqual(sel);
  });

  it('drops unknown ids and invalid os', () => {
    const raw = JSON.stringify({
      v: STORAGE_VERSION,
      selection: { agents: ['nope', agents[0].id], goals: ['gone'], extras: ['x'], os: 'beos' },
    });
    expect(parseStoredSelection(raw, 'linux')).toEqual({ agents: [agents[0].id], goals: [], extras: [], os: 'linux' });
  });

  it('falls back to the recommended agent when none survive', () => {
    const raw = JSON.stringify({ v: STORAGE_VERSION, selection: { agents: [], goals: [], extras: [], os: 'windows' } });
    expect(parseStoredSelection(raw, 'linux')?.agents).toEqual(recommendedAgents());
  });
});

describe('detectOs', () => {
  it('reads userAgentData, platform and userAgent', () => {
    expect(detectOs({ platform: 'MacIntel', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' })).toBe('macos');
    expect(detectOs({ platform: 'Win32', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' })).toBe('windows');
    expect(detectOs({ platform: 'Linux x86_64', userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' })).toBe('linux');
    expect(detectOs({ platform: '', userAgent: '', userAgentData: { platform: 'macOS' } })).toBe('macos');
    expect(detectOs({ platform: 'Linux armv8l', userAgent: 'Mozilla/5.0 (Linux; Android 14)' })).toBe('windows');
  });
});
