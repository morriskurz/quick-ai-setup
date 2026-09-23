// STUB — replaced by content agent
// Minimal, type-valid data so the shell, generator and tests compile.
// Command strings are taken from SPEC.md §5; everything else is placeholder copy.

import type { AgentOption, Extra, Goal, Step } from './types';

export const steps: Record<string, Step> = {
  git: {
    id: 'git',
    title: 'Install Git',
    why: 'Git lets you undo changes and keep versions — for documents too, not only code.',
    kind: 'command',
    commands: {
      windows: [{ run: 'winget install --id Git.Git -e' }],
      macos: [{ run: 'brew install git' }],
      linux: [{ run: 'sudo apt-get install git' }],
    },
    docsUrl: 'https://git-scm.com/downloads',
  },
  'install-claude-code': {
    id: 'install-claude-code',
    title: 'Install Claude Code',
    why: 'Placeholder — the content agent writes this step.',
    kind: 'human',
    human: {
      instructions: 'Placeholder — follow the official install instructions.',
      url: 'https://docs.anthropic.com/en/docs/claude-code/setup',
    },
    docsUrl: 'https://docs.anthropic.com/en/docs/claude-code/setup',
    agents: ['claude-code'],
  },
};

export const agents: AgentOption[] = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    recommended: true,
    summary: 'Placeholder summary.',
    installStepId: 'install-claude-code',
  },
];

export const goals: Goal[] = [
  {
    id: 'docs-versioning',
    label: 'Version control for non-code work',
    summary: 'Placeholder summary.',
    stepIds: ['git'],
  },
];

export const extras: Extra[] = [];

export const baselineStepIds: string[] = ['git'];
