// Coding agents: one install step and one sign-in step per agent.
// COPY: owner review — titles, `why`, instructions.

import type { AgentId, AgentOption, Step } from '../types';

export const agentSteps: Step[] = [
  {
    id: 'install-claude-code',
    title: 'Install Claude Code',
    why: 'Claude Code is the coding agent we recommend. It installs as a single program that updates itself, and it does not need Node.',
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
    why: 'Claude Code runs on your Claude subscription. It needs Pro, Max, Team or Enterprise; the free plan does not include it.',
    kind: 'human',
    agents: ['claude-code'],
    human: {
      instructions:
        'In a terminal, type claude and press Enter. A browser window opens: sign in with your Claude account and confirm. Close Claude Code again with /exit if you only wanted to sign in.',
      url: 'https://claude.ai',
    },
    docsUrl: 'https://code.claude.com/docs/en/setup#authenticate',
  },
  {
    id: 'install-codex',
    title: 'Install Codex',
    why: 'Codex is OpenAI’s coding agent. It is the sensible choice if your company already pays for ChatGPT Plus, Business or Enterprise.',
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
    why: 'Codex runs on your ChatGPT plan. Signing in with ChatGPT avoids setting up a separate API key.',
    kind: 'human',
    agents: ['codex'],
    human: {
      instructions:
        'In a terminal, type codex and press Enter. Choose “Sign in with ChatGPT” and finish the sign-in in the browser.',
      url: 'https://chatgpt.com',
    },
    docsUrl: 'https://developers.openai.com/codex/cli',
  },
  {
    id: 'install-opencode',
    title: 'Install OpenCode',
    why: 'OpenCode is an open-source coding agent that works with many model providers. On Windows its own docs recommend WSL; the npm route below is one of the native options they list.',
    kind: 'command',
    agents: ['opencode'],
    commands: {
      windows: [{ run: 'npm install -g opencode-ai', note: 'Needs Node.js, which is installed in an earlier step.' }],
      macos: [{ run: 'curl -fsSL https://opencode.ai/install | bash' }],
      linux: [{ run: 'curl -fsSL https://opencode.ai/install | bash' }],
    },
    docsUrl: 'https://opencode.ai/docs',
  },
  {
    id: 'login-opencode',
    title: 'Connect OpenCode to a model provider',
    why: 'OpenCode does not come with a model. You connect it to a provider account once, and it remembers the connection.',
    kind: 'human',
    agents: ['opencode'],
    human: {
      instructions:
        'In a terminal, type opencode and press Enter. Type /connect, pick a provider, and follow its sign-in. If the provider shows you a key, paste it into OpenCode yourself; never paste it into a chat.',
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
    summary:
      'Anthropic’s coding agent. Recommended: every tool on this page works with it, and a few (Claude in Chrome, automatic office-file skills) work only with it. Needs a paid Claude plan.',
    installStepId: 'install-claude-code',
  },
  {
    id: 'codex',
    label: 'Codex',
    recommended: false,
    summary: 'OpenAI’s coding agent. Choose it if your company already pays for ChatGPT Plus, Business or Enterprise.',
    installStepId: 'install-codex',
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    recommended: false,
    summary: 'Open-source coding agent that works with many model providers. On Windows, its docs recommend running it in WSL.',
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
