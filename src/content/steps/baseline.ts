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
    why: 'Windows blocks PowerShell scripts by default; tools installed through Node need them.',
    kind: 'human',
    commands: {
      windows: [
        {
          run: 'Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser',
          note: 'Your user account only. Scripts downloaded from the internet still need a signature.',
        },
      ],
    },
    human: {
      instructions: 'Open PowerShell (not as administrator), run the command and answer Y.',
    },
    docsUrl:
      'https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies',
  },
  {
    id: 'homebrew',
    title: 'Install Homebrew',
    why: 'The macOS package manager that several steps below use.',
    kind: 'human',
    commands: {
      macos: [
        {
          // Official form from brew.sh. Piping the script into bash makes stdin a
          // non-TTY, so install.sh switches to NONINTERACTIVE and aborts with
          // "Need sudo access" instead of asking for the password.
          run: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
          note: adminNote('asks for your Mac password.'),
        },
      ],
    },
    human: {
      instructions: [
        'Skip this if `brew --version` prints a version.',
        '1. Run the command in Terminal yourself and enter your Mac password.',
        '2. Run the lines it prints under “Next steps”. They put brew on your PATH.',
        '3. Open a new Terminal window.',
      ].join('\n'),
      url: 'https://brew.sh',
    },
    docsUrl: 'https://brew.sh',
  },
  {
    id: 'git',
    title: 'Install Git',
    why: 'Keeps every version of every file, so the agent can undo its mistakes.',
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
    why: 'Most tools here install through Node; LTS gets security fixes for years.',
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
        { run: '\\. "$HOME/.nvm/nvm.sh"', note: 'Loads nvm in this window.' },
        { run: 'nvm install --lts' },
      ],
      linux: [
        { run: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash` },
        { run: '\\. "$HOME/.nvm/nvm.sh"', note: 'Loads nvm in this window.' },
        { run: 'nvm install --lts' },
      ],
    },
    docsUrl: 'https://nodejs.org/en/download',
  },
  {
    id: 'context7',
    title: 'Connect Context7',
    why: 'Gives the agent current library docs instead of outdated memory.',
    kind: 'human',
    commands: {
      windows: [{ run: (ctx) => ctx7Command(ctx) }],
      macos: [{ run: (ctx) => ctx7Command(ctx) }],
      linux: [{ run: (ctx) => ctx7Command(ctx) }],
    },
    human: {
      instructions:
        'Run the command in your own terminal. Press Enter, sign in on context7.com in the browser and confirm the code. The key is stored for you; paste nothing.',
      url: 'https://context7.com',
    },
    docsUrl: 'https://github.com/upstash/context7#installation',
    warning: 'Needs a free context7.com sign-in; ctx7 sends anonymous usage events unless you set CTX7_TELEMETRY_DISABLED=1.',
  },
  {
    id: 'grill-me',
    title: 'Add the grill-me skill',
    why: 'The agent interviews you before it builds; start a request with “grill me”.',
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
