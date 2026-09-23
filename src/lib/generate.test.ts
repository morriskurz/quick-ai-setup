import { describe, expect, it } from 'vitest';
import { renderCommand, resolvePlan } from './generate';

describe('renderCommand', () => {
  it('returns string commands unchanged', () => {
    expect(renderCommand({ run: 'git --version' }, { agents: ['claude-code'], os: 'linux' })).toBe(
      'git --version',
    );
  });

  it('calls function commands with the context', () => {
    const cmd = {
      run: ({ agents, os }: { agents: string[]; os: string }) =>
        `npx skills add x ${agents.map((a) => `-a ${a}`).join(' ')}${os === 'windows' ? ' --copy' : ''}`,
    };
    expect(renderCommand(cmd, { agents: ['claude-code', 'codex'], os: 'windows' })).toBe(
      'npx skills add x -a claude-code -a codex --copy',
    );
  });
});

describe('resolvePlan', () => {
  it('always includes baseline steps', () => {
    const plan = resolvePlan({ agents: [], goals: [], extras: [], os: 'macos' });
    expect(plan.steps.map((s) => s.id)).toContain('git');
  });
});
