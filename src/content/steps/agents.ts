// Coding agents: one install step and one sign-in step per agent.
// COPY: owner review — titles, `why`, instructions.

import type { AgentId, AgentOption, Step } from '../types';

export const agentSteps: Step[] = [
  {
    id: 'install-claude-code',
    title: 'Install Claude Code',
    why: 'The agent I recommend: one self-updating program, no Node.js needed.',
    kind: 'command',
    agents: ['claude-code'],
    commands: {
      windows: [{ run: 'irm https://claude.ai/install.ps1 | iex' }],
      macos: [{ run: 'curl -fsSL https://claude.ai/install.sh | bash' }],
      linux: [{ run: 'curl -fsSL https://claude.ai/install.sh | bash' }],
    },
    docsUrl: 'https://code.claude.com/docs/en/setup',
  },
  {
    id: 'login-claude-code',
    title: 'Sign in to Claude Code',
    why: 'Needs a paid Claude plan: Pro, Max, Team or Enterprise.',
    kind: 'human',
    agents: ['claude-code'],
    human: {
      instructions: 'Run claude in a terminal. Sign in with your Claude account in the browser that opens, then type /exit.',
      url: 'https://claude.ai',
    },
    docsUrl: 'https://code.claude.com/docs/en/setup#authenticate',
  },
  {
    id: 'install-codex',
    title: 'Install Codex',
    why: 'OpenAI’s coding agent; it runs on your ChatGPT plan.',
    kind: 'command',
    agents: ['codex'],
    commands: {
      windows: [{ run: 'powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"' }],
      macos: [{ run: 'curl -fsSL https://chatgpt.com/codex/install.sh | sh' }],
      linux: [{ run: 'curl -fsSL https://chatgpt.com/codex/install.sh | sh' }],
    },
    docsUrl: 'https://github.com/openai/codex#installing-and-running-codex-cli',
  },
  {
    id: 'login-codex',
    title: 'Sign in to Codex',
    why: 'Signing in with ChatGPT avoids a separate API key.',
    kind: 'human',
    agents: ['codex'],
    human: {
      instructions: 'Run codex in a terminal. Choose “Sign in with ChatGPT” and finish in the browser.',
      url: 'https://chatgpt.com',
    },
    docsUrl: 'https://developers.openai.com/codex/cli',
  },
  {
    id: 'install-opencode',
    title: 'Install OpenCode',
    why: 'Open-source coding agent that works with many model providers.',
    kind: 'command',
    agents: ['opencode'],
    commands: {
      windows: [{ run: 'npm install -g opencode-ai', note: 'Needs Node.js from the earlier step.' }],
      macos: [{ run: 'curl -fsSL https://opencode.ai/install | bash' }],
      linux: [{ run: 'curl -fsSL https://opencode.ai/install | bash' }],
    },
    docsUrl: 'https://opencode.ai/docs',
  },
  {
    id: 'login-opencode',
    title: 'Connect OpenCode to a model provider',
    why: 'OpenCode has no model of its own; connect a provider account once.',
    kind: 'human',
    agents: ['opencode'],
    human: {
      instructions:
        'Run opencode in a terminal. Type /connect, pick a provider and sign in. If it shows you a key, paste it into OpenCode yourself, never into a chat.',
      url: 'https://opencode.ai/docs',
    },
    docsUrl: 'https://opencode.ai/docs',
  },
];

// COPY: owner review
export const agents: AgentOption[] = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    recommended: true,
    summary: 'Anthropic’s agent. Needs a paid Claude plan. Required for Claude in Chrome.',
    installStepId: 'install-claude-code',
  },
  {
    id: 'codex',
    label: 'Codex',
    recommended: false,
    summary: 'OpenAI’s agent, for companies already on ChatGPT Plus, Business or Enterprise.',
    installStepId: 'install-codex',
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    recommended: false,
    summary: 'Open-source, many model providers. On Windows, its docs recommend WSL.',
    installStepId: 'install-opencode',
  },
];

/** Sign-in step per agent; resolvePlan puts these right after the installs. */
export const agentLoginStepIds: Record<AgentId, string> = {
  'claude-code': 'login-claude-code',
  codex: 'login-codex',
  opencode: 'login-opencode',
};

/** Where each agent reads its global instruction file (§1.4 of the content draft). */
export const globalInstructionFiles: Record<AgentId, { posix: string; windows: string; docsUrl: string }> = {
  'claude-code': {
    posix: '~/.claude/CLAUDE.md',
    windows: '$env:USERPROFILE\\.claude\\CLAUDE.md',
    docsUrl: 'https://code.claude.com/docs/en/memory',
  },
  codex: {
    posix: '~/.codex/AGENTS.md',
    // [INFERRED] Codex documents ~/.codex only; USERPROFILE is where ~ resolves on Windows.
    windows: '$env:USERPROFILE\\.codex\\AGENTS.md',
    docsUrl: 'https://developers.openai.com/codex/guides/agents-md',
  },
  opencode: {
    posix: '~/.config/opencode/AGENTS.md',
    // [INFERRED] OpenCode documents ~/.config/opencode only.
    windows: '$env:USERPROFILE\\.config\\opencode\\AGENTS.md',
    docsUrl: 'https://opencode.ai/docs/rules/',
  },
};
