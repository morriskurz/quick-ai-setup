// Turns a Selection into the plan, the agent prompt, the house-rules files and
// the verify script. Signatures of the five exported functions are frozen.

import {
  ADMIN_NOTE_PREFIX,
  agentLoginStepIds,
  agents,
  baselineAfterAgentIds,
  baselineBeforeAgentIds,
  extras,
  globalInstructionFiles,
  goals,
  HOUSE_RULES_STEP_ID,
  steps,
  VERIFY_STEP_ID,
} from '../content';
import { GLOBAL_RULES, PROJECT_EMPTY, PROJECT_FRAGMENTS, PROJECT_HEADER, RTK_RULE } from '../content/rules';
import type { Command, CommandContext, OsId, Selection, SetupPlan, Step } from '../content/types';
import { versionChecks, type VersionCheck } from '../content/verify';

const OS_LABEL: Record<OsId, string> = {
  windows: 'Windows (PowerShell)',
  macos: 'macOS (Terminal, zsh)',
  linux: 'Linux, Debian or Ubuntu (bash)',
};

// ── Plan ────────────────────────────────────────────────────────────────────

/**
 * Ordered, de-duplicated steps for a selection:
 * baseline (before agents) → agent installs → agent sign-ins → baseline (after
 * agents) → goals → extras → house rules → verify.
 * A step is dropped when it is restricted to agents the reader did not pick, or
 * when it has commands but none for the reader's OS (e.g. Homebrew on Windows).
 */
/** Default agent when a selection arrives with none (the picker prevents this; stay safe anyway). */
export const FALLBACK_AGENT = 'claude-code' as const;

/** A copy of the selection that always names at least one agent. */
export function withAgents(selection: Selection): Selection {
  return selection.agents.length ? selection : { ...selection, agents: [FALLBACK_AGENT] };
}

export function resolvePlan(input: Selection): SetupPlan {
  const selection = withAgents(input);
  const pickedAgents = agents.filter((a) => selection.agents.includes(a.id));
  const ids = [
    ...baselineBeforeAgentIds,
    ...pickedAgents.map((a) => a.installStepId),
    ...pickedAgents.map((a) => agentLoginStepIds[a.id]),
    ...baselineAfterAgentIds,
    ...goals.filter((g) => selection.goals.includes(g.id)).flatMap((g) => g.stepIds),
    ...extras.filter((e) => selection.extras.includes(e.id)).flatMap((e) => e.stepIds),
    HOUSE_RULES_STEP_ID,
    VERIFY_STEP_ID,
  ];
  const seen = new Set<string>();
  const out: Step[] = [];
  for (const id of ids) {
    const step = steps[id];
    if (!step || seen.has(id)) continue;
    if (step.agents && !step.agents.some((a) => selection.agents.includes(a))) continue;
    if (step.commands && !step.commands[selection.os]?.length) continue;
    seen.add(id);
    out.push(step);
  }
  return { steps: out };
}

/** Resolve a Command to the literal shell text for this context. */
export function renderCommand(cmd: Command, ctx: CommandContext): string {
  return typeof cmd.run === 'function' ? cmd.run(ctx) : cmd.run;
}

/** True when a command needs a password, sudo or a Windows administrator prompt. */
export function needsAdmin(cmd: Command, ctx: CommandContext): boolean {
  return /\bsudo\b/.test(renderCommand(cmd, ctx)) || (cmd.note?.startsWith(ADMIN_NOTE_PREFIX) ?? false);
}

// ── Prompt ──────────────────────────────────────────────────────────────────

const labelsOf = <T extends { id: string; label: string }>(list: readonly T[], ids: readonly string[]) =>
  list.filter((x) => ids.includes(x.id)).map((x) => x.label);

const fence = (text: string, lang = '') => `~~~${lang}\n${text}\n~~~`;

const indent = (text: string, pad = '   ') =>
  text
    .split('\n')
    .map((l) => (l ? pad + l : l))
    .join('\n');

/** The single copyable prompt for a coding agent. */
export function buildAgentPrompt(input: Selection): string {
  const selection = withAgents(input);
  const plan = resolvePlan(selection);
  const ctx: CommandContext = { agents: selection.agents, os: selection.os };
  const shellLang = selection.os === 'windows' ? 'powershell' : 'bash';
  const goalLabels = labelsOf(goals, selection.goals);
  const extraLabels = labelsOf(extras, selection.extras);

  const rules = [
    'Do the steps below in order, using only the commands given. Skip a step whose tool is already installed (check --version first) and tell me. You are one of the agents listed above: skip installing and signing in to yourself.',
    'Before every command, show it and say in one sentence what it does. Then run it.',
    'If a command fails, explain the error in plain words and suggest a fix. Never switch to a different installer on your own.',
    'Never type, ask for or store passwords, tokens, keys or one-time codes, and never paste them into this chat. Tell me not to either.',
    'When a step says STOP, stop. Tell me exactly what to do and wait until I reply "done".',
    'Never run sudo or administrator commands yourself. Show them to me, STOP, and ask me to run them in my own terminal.',
    'If a command waits for input you cannot give, stop it and ask me.',
    'Do not delete files or change settings beyond what a step says.',
  ];
  if (selection.os === 'windows') {
    rules.push(
      "After each install, refresh PATH in your shell before the next step: $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')",
    );
  } else {
    rules.push('If a newly installed command is not found, reload the shell profile or ask me to open a new terminal.');
  }

  const lines: string[] = [
    'You are setting up this computer for AI-assisted work. I am not a developer: explain in plain language.',
    '',
    'About me',
    `- System: ${OS_LABEL[selection.os]}`,
    `- Coding agents I use: ${labelsOf(agents, selection.agents).join(', ') || 'none selected'}`,
    `- Goals: ${goalLabels.join(', ') || 'only the baseline'}`,
    `- Extras: ${extraLabels.join(', ') || 'none'}`,
    '',
    'Rules for the whole task',
    ...rules.map((r, i) => `${i + 1}. ${r}`),
    '',
    'Steps',
  ];

  plan.steps.forEach((step, i) => {
    const n = i + 1;
    if (step.id === HOUSE_RULES_STEP_ID) {
      lines.push(...houseRulesPromptLines(n, selection), '');
      return;
    }
    if (step.id === VERIFY_STEP_ID) {
      lines.push(
        `${n}. ${step.title}`,
        indent('Paste this check into a fresh shell (do not save it as a file) and show me the full output:'),
        indent(fence(buildVerifyScript(selection), shellLang)),
        '',
      );
      return;
    }

    const cmds = step.commands?.[selection.os] ?? [];
    if (step.kind === 'human') {
      lines.push(`${n}. ${step.title} — STOP: I do this myself.`);
      if (step.human) lines.push(indent(step.human.instructions));
      if (step.human?.url) lines.push(indent(`Link: ${step.human.url}`));
      if (cmds.length) {
        lines.push(indent('Show me these commands to run in my own terminal:'));
        lines.push(indent(fence(cmds.map((c) => renderCommand(c, ctx)).join('\n'), shellLang)));
      }
      if (step.warning) lines.push(indent(`Tell me first: ${step.warning}`));
      lines.push(indent('Wait until I say "done".'), '');
      return;
    }

    lines.push(`${n}. ${step.title}`);
    if (step.warning) lines.push(indent(`Before this step, tell me: ${step.warning}`));
    for (const c of cmds) {
      const text = renderCommand(c, ctx);
      if (needsAdmin(c, ctx)) {
        lines.push(indent('STOP: this needs administrator rights. Show me the command, ask me to run it, and wait until I say "done":'));
      }
      lines.push(indent(fence(text, shellLang)));
      if (c.note && !c.note.startsWith(ADMIN_NOTE_PREFIX)) lines.push(indent(`(${c.note})`));
    }
    lines.push('');
  });

  const { project } = buildAgentsMd(selection);
  const projectFiles = selection.agents.includes('claude-code') ? 'AGENTS.md and CLAUDE.md' : 'AGENTS.md';
  lines.push(
    'Finish',
    '- Summarise briefly: what was installed (with versions), skipped or failed, and which steps I still have to do myself.',
    `- Then show me this template and tell me to copy it into every new project as ${projectFiles}:`,
    fence(project.trimEnd(), 'markdown'),
  );

  return lines.join('\n');
}

function houseRulesPromptLines(n: number, selection: Selection): string[] {
  const files = agents
    .filter((a) => selection.agents.includes(a.id))
    .map((a) => {
      const f = globalInstructionFiles[a.id];
      return `- ${a.label}: ${selection.os === 'windows' ? f.windows : f.posix}`;
    });
  const { global } = buildAgentsMd(selection);
  return [
    `${n}. Write the house rules into each agent's global instruction file:`,
    indent(files.join('\n')),
    indent(
      [
        'For each file:',
        '- The first step made the backup. Do not make another: installers have changed the file since.',
        '- Merge: keep everything in the file and add the rules below at the end, leaving out any rule it already states in other words.',
        '- If it does not exist, create it (and its folder) with the rules below.',
        '- Show me the final file before saving it.',
      ].join('\n'),
    ),
    indent(fence(global.trimEnd(), 'markdown')),
  ];
}

// ── House rules ─────────────────────────────────────────────────────────────

/** AGENTS.md / CLAUDE.md content: global baseline and per-project template. */
export function buildAgentsMd(input: Selection): { global: string; project: string } {
  const selection = withAgents(input);
  const global = GLOBAL_RULES + (selection.extras.includes('rtk') ? RTK_RULE : '');
  const fragments = goals.filter((g) => selection.goals.includes(g.id)).map((g) => PROJECT_FRAGMENTS[g.id](selection));
  const project = PROJECT_HEADER + (fragments.length ? fragments.join('') : PROJECT_EMPTY);
  return { global, project };
}

// ── Verify script ───────────────────────────────────────────────────────────

function selectedChecks(selection: Selection): VersionCheck[] {
  const seen = new Set<string>();
  const out: VersionCheck[] = [];
  for (const step of resolvePlan(selection).steps) {
    for (const check of versionChecks[step.id] ?? []) {
      if (seen.has(check.label)) continue;
      seen.add(check.label);
      out.push(check);
    }
  }
  return out;
}

const shQuote = (s: string) => (/^[\w@%+=:,./-]+$/.test(s) ? s : `'${s.replace(/'/g, `'\\''`)}'`);
const psQuote = (s: string) => `'${s.replace(/'/g, "''")}'`;

/** One script per OS that prints every installed version. */
export function buildVerifyScript(input: Selection): string {
  const selection = withAgents(input);
  const checks = selectedChecks(selection);
  return selection.os === 'windows' ? powershellVerify(checks) : bashVerify(checks);
}

/** User-level install folders that a fresh terminal would have on PATH. */
function userBinDirs(checks: VersionCheck[]): string {
  const dirs = ['"$HOME/.local/bin"'];
  if (checks.some((c) => c.bin === 'flutter')) dirs.push('"$HOME/develop/flutter/bin"');
  return dirs.join(' ');
}

function bashVerify(checks: VersionCheck[]): string {
  const width = Math.max(14, ...checks.map((c) => c.label.length)) + 2;
  return [
    '#!/usr/bin/env bash',
    '# quick-ai-setup check: prints versions, installs nothing, changes nothing.',
    '# Pick up tools installed in this session before the terminal was reopened.',
    '[ -s "$HOME/.nvm/nvm.sh" ] && \\. "$HOME/.nvm/nvm.sh"',
    `for d in ${userBinDirs(checks)}; do [ -d "$d" ] && PATH="$d:$PATH"; done`,
    '',
    'v() {',
    '  local label="$1"; shift',
    '  if command -v "$1" >/dev/null 2>&1; then',
    '    local out',
    '    out="$("$@" 2>&1 | head -n 1)"',
    `    printf '%-${width}s %s\\n' "$label" "\${out:-installed}"`,
    '  else',
    `    printf '%-${width}s %s\\n' "$label" "not installed"`,
    '  fi',
    '}',
    '',
    ...checks.map((c) => ['v', shQuote(c.label), c.bin, ...(c.args ?? ['--version']).map(shQuote)].join(' ')),
    '',
    'echo',
    'echo "Skills installed for all projects:"',
    // The skills CLI prints colour codes even when piped; strip them.
    "if command -v npx >/dev/null 2>&1; then npx -y skills list -g 2>&1 | sed $'s/\\x1b\\\\[[0-9;]*m//g'; else echo \"npx not installed\"; fi",
  ].join('\n');
}

function powershellVerify(checks: VersionCheck[]): string {
  const width = Math.max(14, ...checks.map((c) => c.label.length)) + 2;
  return [
    '# quick-ai-setup check: prints versions, installs nothing, changes nothing.',
    '# Pick up PATH changes made by installers since this window was opened.',
    "$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')",
    'function Show-Version([string]$Label, [string]$Bin, [string[]]$Arguments) {',
    '  # Application only: finds .exe and .cmd, skips .ps1 shims that script policy may block.',
    '  $cmd = Get-Command $Bin -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1',
    `  if (-not $cmd) { '{0,-${width}} {1}' -f $Label, 'not installed'; return }`,
    '  try { $out = & $cmd.Source @Arguments 2>&1 | Select-Object -First 1 } catch { $out = $null }',
    "  if (-not $out) { $out = 'installed' }",
    `  '{0,-${width}} {1}' -f $Label, "$out"`,
    '}',
    '',
    ...checks.map(
      (c) => `Show-Version ${psQuote(c.label)} ${psQuote(c.bin)} @(${(c.args ?? ['--version']).map(psQuote).join(', ')})`,
    ),
    '',
    "''",
    "'Skills installed for all projects:'",
    '$npx = Get-Command npx -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1',
    "if ($npx) { & $npx.Source -y skills list -g 2>&1 | ForEach-Object { \"$_\" -replace \"$([char]27)\\[[0-9;]*m\", '' } } else { 'npx not installed' }",
  ].join('\n');
}
