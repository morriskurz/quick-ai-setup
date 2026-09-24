// Turns a Selection into the plan, the agent prompt, the house-rules files and
// the verify script. Signatures of the five exported functions are frozen, apart from the
// trailing `lang` parameter (default 'en') on the ones that emit prose. The verify script
// stays English: it prints tool output, and the page says so.

import {
  agentLoginStepIds,
  agents,
  baselineAfterAgentIds,
  baselineBeforeAgentIds,
  extras,
  globalInstructionFiles,
  goals,
  HOUSE_RULES_STEP_ID,
  isAdminNote,
  steps,
  VERIFY_STEP_ID,
} from '../content';
import { PROMPT_DE } from '../content/de/prompt';
import { PROJECT_EMPTY_DE, PROJECT_FRAGMENTS_DE, PROJECT_HEADER_DE } from '../content/de/rules';
import { contentFor, localizeStep } from '../content/i18n';
import { AGENTS_MD_HEADING, CLAUDE_MD_HEADING, GLOBAL_RULES_BODY, PROJECT_EMPTY, PROJECT_FRAGMENTS, PROJECT_HEADER, RTK_RULE } from '../content/rules';
import type { Command, CommandContext, Lang, OsId, Selection, SetupPlan, Step } from '../content/types';
import { versionChecks, type VersionCheck } from '../content/verify';

/** Every piece of prose the prompt generator emits, per language. */
export interface PromptText {
  osLabel: Record<OsId, string>;
  intro: string;
  aboutMe: string;
  system: string;
  agentsUsed: string;
  noAgents: string;
  goals: string;
  noGoals: string;
  extras: string;
  noExtras: string;
  rulesHeading: string;
  rules: string[];
  windowsPathRule: (refresh: string) => string;
  posixPathRule: string;
  stepsHeading: string;
  verifyInstruction: string;
  humanStop: string;
  link: string;
  showCommands: string;
  tellFirst: string;
  waitDone: string;
  beforeStep: string;
  adminStop: string;
  finishHeading: string;
  summary: string;
  bothFiles: string;
  showTemplate: (files: string) => string;
  startClaude: string;
  startOthers: (agentNames: string) => string;
  or: string;
  startLine: (parts: string) => string;
  houseRulesHeading: (n: number) => string;
  forEachFile: string;
  backupDone: string;
  merge: string;
  create: string;
  agentsMdHeading: (agentsHeading: string, claudeHeading: string) => string;
  /** Only where the rules' language differs from the prompt's. */
  keepRulesVerbatim?: string;
  showFinal: string;
}

const PATH_REFRESH =
  "$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')";

export const PROMPT_EN: PromptText = {
  osLabel: {
    windows: 'Windows (PowerShell)',
    macos: 'macOS (Terminal, zsh)',
    linux: 'Linux, Debian or Ubuntu (bash)',
  },
  intro: 'You are setting up this computer for AI-assisted work. I am not a developer: explain in plain language.',
  aboutMe: 'About me',
  system: 'System',
  agentsUsed: 'Coding agents I use',
  noAgents: 'none selected',
  goals: 'Goals',
  noGoals: 'only the baseline',
  extras: 'Extras',
  noExtras: 'none',
  rulesHeading: 'Rules for the whole task',
  rules: [
    'Do the steps below in order, using only the commands given. Skip a step whose tool is already installed (check --version first) and tell me. You are one of the agents listed above: skip installing and signing in to yourself.',
    'Before every command, show it and say in one sentence what it does. Then run it.',
    'If a command fails, explain the error in plain words and suggest a fix. Never switch to a different installer on your own.',
    'Never type, ask for or store passwords, tokens, keys or one-time codes, and never paste them into this chat. Tell me not to either.',
    'When a step says STOP, stop. Tell me exactly what to do and wait until I reply "done".',
    'Never run sudo or administrator commands yourself. Show them to me, STOP, and ask me to run them in my own terminal.',
    'If a command waits for input you cannot give, stop it and ask me.',
    'Do not delete files or change settings beyond what a step says.',
  ],
  windowsPathRule: (refresh) => `After each install, refresh PATH in your shell before the next step: ${refresh}`,
  posixPathRule: 'If a newly installed command is not found, reload the shell profile or ask me to open a new terminal.',
  stepsHeading: 'Steps',
  verifyInstruction: 'Paste this check into a fresh shell (do not save it as a file) and show me the full output:',
  humanStop: '— STOP: I do this myself.',
  link: 'Link',
  showCommands: 'Show me these commands to run in my own terminal:',
  tellFirst: 'Tell me first:',
  waitDone: 'Wait until I say "done".',
  beforeStep: 'Before this step, tell me:',
  adminStop: 'STOP: this needs administrator rights. Show me the command, ask me to run it, and wait until I say "done":',
  finishHeading: 'Finish',
  summary:
    '- Summarise briefly: what was installed (with versions), skipped or failed, and which steps I still have to do myself.',
  bothFiles: 'AGENTS.md and CLAUDE.md',
  showTemplate: (files) => `- Then show me this template and tell me to copy it into every new project as ${files}:`,
  startClaude: 'restart Claude Code in a project folder and type /grill-me followed by what I want to achieve',
  startOthers: (names) => `in ${names}, start in a project folder and type "Use the grill-me skill:" followed by what I want`,
  or: ' or ',
  startLine: (parts) => `- Finally, tell me how to get started: ${parts}.`,
  houseRulesHeading: (n) => `${n}. Write the house rules into each agent's global instruction file:`,
  forEachFile: 'For each file:',
  backupDone: '- The first step made the backup. Do not make another: installers have changed the file since.',
  merge: '- Merge: keep everything in the file and add the rules below at the end, leaving out any rule it already states in other words.',
  create: '- If it does not exist, create it (and its folder) with the rules below.',
  agentsMdHeading: (a, c) => `- In AGENTS.md files, the first line is "${a}" instead of "${c}".`,
  showFinal: '- Show me the final file before saving it.',
};

const PROMPT_TEXT: Record<Lang, PromptText> = { en: PROMPT_EN, de: PROMPT_DE };

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

export function resolvePlan(input: Selection, lang: Lang = 'en'): SetupPlan {
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
    out.push(localizeStep(step, lang));
  }
  return { steps: out };
}

/** Resolve a Command to the literal shell text for this context. */
export function renderCommand(cmd: Command, ctx: CommandContext): string {
  return typeof cmd.run === 'function' ? cmd.run(ctx) : cmd.run;
}

/** True when a command needs a password, sudo or a Windows administrator prompt. */
export function needsAdmin(cmd: Command, ctx: CommandContext): boolean {
  return /\bsudo\b/.test(renderCommand(cmd, ctx)) || isAdminNote(cmd.note);
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
export function buildAgentPrompt(input: Selection, lang: Lang = 'en'): string {
  const selection = withAgents(input);
  const plan = resolvePlan(selection, lang);
  const t = PROMPT_TEXT[lang];
  const c = contentFor(lang);
  const ctx: CommandContext = { agents: selection.agents, os: selection.os };
  const shellLang = selection.os === 'windows' ? 'powershell' : 'bash';
  const goalLabels = labelsOf(c.goals, selection.goals);
  const extraLabels = labelsOf(c.extras, selection.extras);

  const rules = [...t.rules, selection.os === 'windows' ? t.windowsPathRule(PATH_REFRESH) : t.posixPathRule];

  const lines: string[] = [
    t.intro,
    '',
    t.aboutMe,
    `- ${t.system}: ${t.osLabel[selection.os]}`,
    `- ${t.agentsUsed}: ${labelsOf(c.agents, selection.agents).join(', ') || t.noAgents}`,
    `- ${t.goals}: ${goalLabels.join(', ') || t.noGoals}`,
    `- ${t.extras}: ${extraLabels.join(', ') || t.noExtras}`,
    '',
    t.rulesHeading,
    ...rules.map((r, i) => `${i + 1}. ${r}`),
    '',
    t.stepsHeading,
  ];

  plan.steps.forEach((step, i) => {
    const n = i + 1;
    if (step.id === HOUSE_RULES_STEP_ID) {
      lines.push(...houseRulesPromptLines(n, selection, lang), '');
      return;
    }
    if (step.id === VERIFY_STEP_ID) {
      lines.push(
        `${n}. ${step.title}`,
        indent(t.verifyInstruction),
        indent(fence(buildVerifyScript(selection), shellLang)),
        '',
      );
      return;
    }

    const cmds = step.commands?.[selection.os] ?? [];
    if (step.kind === 'human') {
      lines.push(`${n}. ${step.title} ${t.humanStop}`);
      if (step.human) lines.push(indent(step.human.instructions));
      if (step.human?.url) lines.push(indent(`${t.link}: ${step.human.url}`));
      if (cmds.length) {
        lines.push(indent(t.showCommands));
        lines.push(indent(fence(cmds.map((cmd) => renderCommand(cmd, ctx)).join('\n'), shellLang)));
      }
      if (step.warning) lines.push(indent(`${t.tellFirst} ${step.warning}`));
      lines.push(indent(t.waitDone), '');
      return;
    }

    lines.push(`${n}. ${step.title}`);
    if (step.warning) lines.push(indent(`${t.beforeStep} ${step.warning}`));
    for (const cmd of cmds) {
      const text = renderCommand(cmd, ctx);
      if (needsAdmin(cmd, ctx)) lines.push(indent(t.adminStop));
      lines.push(indent(fence(text, shellLang)));
      if (cmd.note && !isAdminNote(cmd.note)) lines.push(indent(`(${cmd.note})`));
    }
    lines.push('');
  });

  const { project } = buildAgentsMd(selection, lang);
  const projectFiles = selection.agents.includes('claude-code') ? t.bothFiles : 'AGENTS.md';
  lines.push(
    t.finishHeading,
    t.summary,
    t.showTemplate(projectFiles),
    fence(project.trimEnd(), 'markdown'),
    startPromptLine(selection, t),
  );

  return lines.join('\n');
}

/** Last thing the agent tells the user: how to start real work with grill-me. */
function startPromptLine(selection: Selection, t: PromptText): string {
  const claude = selection.agents.includes('claude-code');
  const others = selection.agents.filter((a) => a !== 'claude-code').map((a) => agents.find((o) => o.id === a)?.label ?? a);
  const parts: string[] = [];
  if (claude) parts.push(t.startClaude);
  if (others.length) parts.push(t.startOthers(others.join(t.or)));
  return t.startLine(parts.join('; '));
}

function houseRulesPromptLines(n: number, selection: Selection, lang: Lang): string[] {
  const t = PROMPT_TEXT[lang];
  const files = agents
    .filter((a) => selection.agents.includes(a.id))
    .map((a) => {
      const f = globalInstructionFiles[a.id];
      return `- ${a.label}: ${selection.os === 'windows' ? f.windows : f.posix}`;
    });
  const { global } = buildAgentsMd(selection, lang);
  const mixed = selection.agents.includes('claude-code') && selection.agents.some((a) => a !== 'claude-code');
  return [
    t.houseRulesHeading(n),
    indent(files.join('\n')),
    indent(
      [
        t.forEachFile,
        t.backupDone,
        t.merge,
        t.create,
        ...(mixed ? [t.agentsMdHeading(AGENTS_MD_HEADING, CLAUDE_MD_HEADING)] : []),
        ...(t.keepRulesVerbatim ? [t.keepRulesVerbatim] : []),
        t.showFinal,
      ].join('\n'),
    ),
    indent(fence(global.trimEnd(), 'markdown')),
  ];
}

// ── House rules ─────────────────────────────────────────────────────────────

/** AGENTS.md / CLAUDE.md content: global baseline and per-project template. */
export function buildAgentsMd(input: Selection, lang: Lang = 'en'): { global: string; project: string } {
  const selection = withAgents(input);
  // CLAUDE.md keeps the owner's heading; AGENTS.md (Codex, OpenCode) gets a neutral one.
  // The global file is the owner's own and stays English in every language.
  const heading = selection.agents.includes('claude-code') ? CLAUDE_MD_HEADING : AGENTS_MD_HEADING;
  const global = heading + '\n' + GLOBAL_RULES_BODY + (selection.extras.includes('rtk') ? RTK_RULE : '');
  const [header, empty, fragmentsFor] =
    lang === 'de'
      ? [PROJECT_HEADER_DE, PROJECT_EMPTY_DE, PROJECT_FRAGMENTS_DE]
      : [PROJECT_HEADER, PROJECT_EMPTY, PROJECT_FRAGMENTS];
  const fragments = goals.filter((g) => selection.goals.includes(g.id)).map((g) => fragmentsFor[g.id](selection));
  const project = header + (fragments.length ? fragments.join('') : empty);
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
