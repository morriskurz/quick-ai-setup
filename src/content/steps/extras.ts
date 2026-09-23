// Extras (off by default) and the two closing steps: house rules and verify.
// COPY: owner review — titles, `why`, warnings.

import { selectedAgents, skillsAdd } from '../helpers';
import type { Command, CommandContext, Extra, OsId, Step } from '../types';
import { globalInstructionFiles } from './agents';

const all = (cmds: Command[]): Partial<Record<OsId, Command[]>> => ({ windows: cmds, macos: cmds, linux: cmds });

export const RTK_TELEMETRY_DOCS = 'https://github.com/rtk-ai/rtk/blob/master/docs/TELEMETRY.md';

const RTK_AGENTS_DOCS = 'https://github.com/rtk-ai/rtk/blob/master/docs/guide/getting-started/supported-agents.md';

export const HOUSE_RULES_STEP_ID = 'house-rules';
export const VERIFY_STEP_ID = 'verify';
export const BACKUP_STEP_ID = 'backup-instructions';

const BACKUP_NOTE = 'Makes a dated copy of each file that exists and never overwrites an earlier copy.';

export const extraSteps: Step[] = [
  {
    id: 'rtk',
    title: 'Install RTK',
    why: 'Commands such as test runs and file listings print a lot of text. RTK shortens that output before the agent reads it, which saves usage on long sessions.',
    kind: 'command',
    commands: {
      windows: [{ run: 'winget install rtk-ai.rtk' }],
      macos: [{ run: 'brew install rtk' }],
      linux: [{ run: 'curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh' }],
    },
    docsUrl: 'https://github.com/rtk-ai/rtk#installation',
    warning:
      'RTK has optional usage statistics (telemetry). According to its telemetry documentation they are off by default and only sent if you agree when `rtk init` asks. Check with `rtk telemetry status`, switch off with `rtk telemetry disable`, or block completely with the environment variable RTK_TELEMETRY_DISABLED=1. Details: ' +
      RTK_TELEMETRY_DOCS,
  },
  {
    id: 'rtk-init-claude-code',
    title: 'Connect RTK to Claude Code',
    why: 'Installs RTK’s hook, so Claude Code’s shell commands are shortened automatically. Restart Claude Code afterwards.',
    kind: 'command',
    agents: ['claude-code'],
    commands: all([{ run: 'rtk init -g', note: 'May ask whether to share anonymous usage statistics. Only you answer that question: an agent stops and asks you.' }]),
    docsUrl: RTK_AGENTS_DOCS,
  },
  {
    id: 'rtk-init-codex',
    title: 'Connect RTK to Codex',
    why: 'Installs RTK’s hook for Codex, so its shell commands are shortened automatically. Restart Codex afterwards.',
    kind: 'command',
    agents: ['codex'],
    commands: all([{ run: 'rtk init -g --codex', note: 'May ask whether to share anonymous usage statistics. Only you answer that question: an agent stops and asks you.' }]),
    docsUrl: RTK_AGENTS_DOCS,
  },
  {
    id: 'rtk-init-opencode',
    title: 'Connect RTK to OpenCode',
    // `rtk init --help` (0.49.0) says "--opencode: Install OpenCode plugin (in addition to Claude Code)".
    // The source says otherwise: main.rs sets install_claude = !opencode, and init.rs then runs
    // run_opencode_only_mode, which writes only ~/.config/opencode/plugins/rtk.ts (checked at
    // tag v0.49.0 and at HEAD b748a5f, 2026-09-23). The help text is misleading.
    why: 'Installs RTK’s OpenCode plugin, so its shell commands are shortened automatically. It installs only the OpenCode plugin, no Claude Code hook. Restart OpenCode afterwards.',
    kind: 'command',
    agents: ['opencode'],
    commands: all([
      { run: 'rtk init -g --opencode', note: 'May ask whether to share anonymous usage statistics. Only you answer that question: an agent stops and asks you.' },
    ]),
    docsUrl: RTK_AGENTS_DOCS,
  },
  {
    id: 'caveman',
    title: 'Add the Caveman skill',
    why: 'Shorter answers mean less reading and lower usage. Code, commands and error messages stay unchanged; only the prose around them is shortened. Say “stop caveman” to switch it off in a session.',
    kind: 'command',
    commands: all([{ run: skillsAdd('JuliusBrussee/caveman', ['caveman']) }]),
    docsUrl: 'https://github.com/JuliusBrussee/caveman#small-rock-the-skill',
  },

  // ── Closing steps ─────────────────────────────────────────────────────────
  {
    id: BACKUP_STEP_ID,
    title: 'Back up your agents’ instruction files',
    why: 'Some installers on this page add lines to these files (Context7 and RTK do). A dated copy made before anything else runs keeps the files exactly as you had them. On a new computer there is nothing to copy yet.',
    kind: 'command',
    commands: {
      windows: [{ run: (ctx) => backupCommand(ctx, 'windows'), note: BACKUP_NOTE }],
      macos: [{ run: (ctx) => backupCommand(ctx, 'macos'), note: BACKUP_NOTE }],
      linux: [{ run: (ctx) => backupCommand(ctx, 'linux'), note: BACKUP_NOTE }],
    },
    docsUrl: 'https://code.claude.com/docs/en/memory',
  },
  {
    id: HOUSE_RULES_STEP_ID,
    title: 'Write the house rules file',
    why: 'A short file of rules the agent reads at the start of every session: check your work, run what you wrote, say what you assumed. You write it once instead of repeating it every time.',
    // 'human' for the manual path (you paste the rules). In the prompt path the agent
    // writes the file; buildAgentPrompt handles this step specially.
    kind: 'human',
    human: {
      instructions:
        'Open each agent’s instruction file in a text editor and add the house rules shown on this page at the end. Keep what is already there; the backup from the first step has the original.',
    },
    docsUrl: 'https://code.claude.com/docs/en/memory',
  },
  {
    id: VERIFY_STEP_ID,
    title: 'Check the setup',
    why: 'One script prints the version of every tool you picked, or “not installed”. It reads only and changes nothing.',
    kind: 'command',
    docsUrl: 'https://github.com/morriskurz/quick-ai-setup',
  },
];

/** Back up each selected agent's global instruction file, if it exists and has no backup from today. */
function backupCommand(ctx: CommandContext, os: OsId): string {
  const files = selectedAgents(ctx).map((a) => globalInstructionFiles[a]);
  if (os === 'windows') {
    return files
      .map((f) => {
        const p = f.windows.replace('$env:USERPROFILE', '$HOME');
        const b = `${p}.backup-$(Get-Date -Format yyyy-MM-dd)`;
        return `if ((Test-Path "${p}") -and -not (Test-Path "${b}")) { Copy-Item "${p}" "${b}" }`;
      })
      .join('\n');
  }
  return files
    .map((f) => {
      const p = f.posix.replace('~', '"$HOME"');
      const b = `${p}.backup-$(date +%F)`;
      return `if [ -f ${p} ] && [ ! -e ${b} ]; then cp ${p} ${b}; fi`;
    })
    .join('\n');
}

// COPY: owner review
export const extras: Extra[] = [
  {
    id: 'rtk',
    label: 'RTK: shorter tool output',
    summary: 'Compresses the output of commands the agent runs, so more work fits into one session.',
    warning:
      'Compression makes mistakes harder to spot: you see less of what the agent saw. Add it after a few weeks, once you know what normal output looks like. RTK has optional telemetry, off unless you agree to it.',
    stepIds: ['rtk', 'rtk-init-claude-code', 'rtk-init-codex', 'rtk-init-opencode'],
  },
  {
    id: 'caveman',
    label: 'Caveman: shorter answers',
    summary: 'Makes the agent answer in terse fragments. Faster to read once you are used to it, harder before.',
    warning:
      'Compression makes mistakes harder to spot: you see less of the agent’s reasoning. Add it after a few weeks, not on day one.',
    stepIds: ['caveman'],
  },
];
