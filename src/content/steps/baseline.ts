// Baseline steps: always part of the plan (filtered by OS where a step only
// applies to one system). Sources are linked in each step's docsUrl.
// COPY: owner review — every `why`, `title`, `instructions` and `warning` string.

import { adminNote, CTX7_FLAG, selectedAgents, skillsAdd } from '../helpers';
import type { Step } from '../types';

/** nvm release used on macOS and Linux (nvm-sh/nvm README, checked 2026-09-23). */
export const NVM_VERSION = 'v0.40.8';

export const baselineSteps: Step[] = [
  {
    id: 'powershell-scripts',
    title: 'Allow PowerShell to run installed tools',
    why: 'Windows blocks every PowerShell script file until you change one setting, and tools installed through Node (npx, the skills CLI, agent-browser, gws) start through such script files. RemoteSigned for your own user account is the setting Microsoft documents: scripts downloaded from the internet still need a signature.',
    kind: 'human',
    commands: {
      windows: [
        {
          run: 'Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser',
          note: 'Changes a security setting for your user account only. Run it yourself and answer the question with Y.',
        },
      ],
    },
    human: {
      instructions:
        'Open PowerShell (not as administrator) and run the command shown. It asks for confirmation; answer Y. You can check the result with Get-ExecutionPolicy -List.',
    },
    docsUrl:
      'https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies',
  },
  {
    id: 'homebrew',
    title: 'Install Homebrew',
    why: 'Homebrew is the package manager most macOS tools are installed with. Several steps below use it.',
    kind: 'human',
    commands: {
      macos: [
        {
          run: 'curl -o- https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash',
          note: adminNote('asks for your Mac password.'),
        },
      ],
    },
    human: {
      instructions:
        'Skip this if `brew --version` already prints a version. Otherwise run the command in Terminal yourself. It asks for your Mac password and may install Apple’s command line tools. At the end it prints “Next steps”: run those lines too, they put brew on your PATH. Then open a new Terminal window.',
      url: 'https://brew.sh',
    },
    docsUrl: 'https://brew.sh',
  },
  {
    id: 'git',
    title: 'Install Git',
    why: 'Git keeps every version of every file in a folder and lets you go back to any of them. The agent uses it to undo its own mistakes, and you can use it for documents, not only code.',
    kind: 'command',
    commands: {
      windows: [
        {
          run: 'winget install --id Git.Git -e --source winget',
          note: adminNote('Windows may ask you to allow the installer to make changes.'),
        },
      ],
      macos: [{ run: 'brew install git' }],
      linux: [{ run: 'sudo apt-get install git', note: adminNote('asks for your password (Debian and Ubuntu).') }],
    },
    docsUrl: 'https://git-scm.com/install/',
  },
  {
    id: 'node',
    title: 'Install Node.js LTS',
    why: 'Most tools on this page, including every skill, are installed through Node. LTS is the long-term support line: it gets security fixes for years, not months.',
    kind: 'command',
    commands: {
      windows: [
        {
          run: 'winget install --id OpenJS.NodeJS.LTS -e',
          note: adminNote('Windows may ask you to allow the installer to make changes.'),
        },
      ],
      macos: [
        { run: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash` },
        { run: '\\. "$HOME/.nvm/nvm.sh"', note: 'Loads nvm in this window, instead of opening a new one.' },
        { run: 'nvm install --lts' },
      ],
      linux: [
        { run: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash` },
        { run: '\\. "$HOME/.nvm/nvm.sh"', note: 'Loads nvm in this window, instead of opening a new one.' },
        { run: 'nvm install --lts' },
      ],
    },
    docsUrl: 'https://nodejs.org/en/download',
  },
  {
    id: 'context7',
    title: 'Connect Context7',
    why: 'Coding agents learn from old documentation and sometimes call functions that no longer exist. Context7 gives them the current documentation of whatever library they use, which removes a large share of that guessing.',
    kind: 'human',
    commands: {
      windows: [{ run: (ctx) => ctx7Command(ctx) }],
      macos: [{ run: (ctx) => ctx7Command(ctx) }],
      linux: [{ run: (ctx) => ctx7Command(ctx) }],
    },
    human: {
      instructions:
        'Run the command in your own terminal. It shows a short code and waits: press Enter, sign in on context7.com in the browser that opens, and confirm the code. Setup then creates a free personal key and stores it in your agent’s settings. You do not copy or paste any key.',
      url: 'https://context7.com',
    },
    docsUrl: 'https://github.com/upstash/context7#installation',
    warning:
      'Needs a free sign-in at context7.com. The ctx7 command-line tool also sends anonymous usage events; set CTX7_TELEMETRY_DISABLED=1 to switch them off.',
  },
  {
    id: 'grill-me',
    title: 'Add the grill-me skill',
    why: 'Before anything gets built, the agent interviews you until it understands what you want. Getting requirements right is still the hardest part of any project, with or without AI. Start a request with “grill me” to use it.',
    kind: 'command',
    commands: {
      windows: [{ run: skillsAdd('vechain/vechain-ai-skills', ['grill-me']) }],
      macos: [{ run: skillsAdd('vechain/vechain-ai-skills', ['grill-me']) }],
      linux: [{ run: skillsAdd('vechain/vechain-ai-skills', ['grill-me']) }],
    },
    docsUrl: 'https://github.com/vechain/vechain-ai-skills#grill-me',
  },
];

function ctx7Command(ctx: Parameters<typeof selectedAgents>[0]): string {
  const flags = selectedAgents(ctx).map((a) => CTX7_FLAG[a]);
  return ['npx ctx7 setup', ...flags, '--mcp'].join(' ');
}
