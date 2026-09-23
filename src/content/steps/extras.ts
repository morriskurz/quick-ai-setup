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

const BACKUP_NOTE = 'Never overwrites an earlier copy.';

const RTK_INIT_NOTE = 'May ask to share usage statistics. Only you answer; an agent stops and asks you.';

export const extraSteps: Step[] = [
  {
    id: 'rtk',
    title: 'Install RTK',
    why: 'Shortens command output before the agent reads it, which saves usage.',
    kind: 'command',
    commands: {
      windows: [{ run: 'winget install rtk-ai.rtk' }],
      macos: [{ run: 'brew install rtk' }],
      linux: [{ run: 'curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh' }],
    },
    docsUrl: 'https://github.com/rtk-ai/rtk#installation',
    warning: `Telemetry is off unless you agree when \`rtk init\` asks: check with \`rtk telemetry status\`, switch off with \`rtk telemetry disable\`, block with RTK_TELEMETRY_DISABLED=1 (${RTK_TELEMETRY_DOCS}).`,
  },
  {
    id: 'rtk-init-claude-code',
    title: 'Connect RTK to Claude Code',
    why: 'Installs RTK’s Claude Code hook; restart Claude Code afterwards.',
    kind: 'command',
    agents: ['claude-code'],
    commands: all([{ run: 'rtk init -g', note: RTK_INIT_NOTE }]),
    docsUrl: RTK_AGENTS_DOCS,
  },
  {
    id: 'rtk-init-codex',
    title: 'Connect RTK to Codex',
    why: 'Installs RTK’s Codex hook; restart Codex afterwards.',
    kind: 'command',
    agents: ['codex'],
    commands: all([{ run: 'rtk init -g --codex', note: RTK_INIT_NOTE }]),
    docsUrl: RTK_AGENTS_DOCS,
  },
  {
    id: 'rtk-init-opencode',
    title: 'Connect RTK to OpenCode',
    // `rtk init --help` (0.49.0) says "--opencode: Install OpenCode plugin (in addition to Claude Code)".
    // The source says otherwise: main.rs sets install_claude = !opencode, and init.rs then runs
    // run_opencode_only_mode, which writes only ~/.config/opencode/plugins/rtk.ts (checked at
    // tag v0.49.0 and at HEAD b748a5f, 2026-09-23). The help text is misleading.
    why: 'Installs only RTK’s OpenCode plugin, no Claude Code hook; restart OpenCode afterwards.',
    kind: 'command',
    agents: ['opencode'],
    commands: all([
      { run: 'rtk init -g --opencode', note: RTK_INIT_NOTE },
    ]),
    docsUrl: RTK_AGENTS_DOCS,
  },
  {
    id: 'caveman',
    title: 'Add the Caveman skill',
    why: 'Shortens prose around code, commands and errors; “stop caveman” switches it off.',
    kind: 'command',
    commands: all([{ run: skillsAdd('JuliusBrussee/caveman', ['caveman']) }]),
    docsUrl: 'https://github.com/JuliusBrussee/caveman#small-rock-the-skill',
  },

  // ── Closing steps ─────────────────────────────────────────────────────────
  {
    id: BACKUP_STEP_ID,
    title: 'Back up your agents’ instruction files',
    why: 'Context7 and RTK edit these files, so a dated copy comes first.',
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
    why: 'Rules the agent reads every session: check work, run what you wrote, state assumptions.',
    // 'human' for the manual path (you paste the rules). In the prompt path the agent
    // writes the file; buildAgentPrompt handles this step specially.
    kind: 'human',
    human: {
      instructions: 'Add the house rules below to the end of each agent’s instruction file. Keep what is already there.',
    },
    docsUrl: 'https://code.claude.com/docs/en/memory',
  },
  {
    id: VERIFY_STEP_ID,
    title: 'Check the setup',
    why: 'Prints each tool’s version or “not installed”; changes nothing.',
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
    summary: 'Compresses command output so more work fits into one session.',
    warning: 'You see less of what the agent saw; telemetry is optional and off unless you agree.',
    stepIds: ['rtk', 'rtk-init-claude-code', 'rtk-init-codex', 'rtk-init-opencode'],
  },
  {
    id: 'caveman',
    label: 'Caveman: shorter answers',
    summary: 'Terse answers: faster to read once you are used to them.',
    warning: 'You see less of the agent’s reasoning.',
    stepIds: ['caveman'],
  },
];
