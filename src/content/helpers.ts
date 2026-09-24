// Small builders shared by the step files. Everything that turns the reader's
// agent selection into command-line flags lives here, so the flag spelling is
// defined once.

import type { AgentId, CommandContext } from './types';

/** Stable agent order, matching the picker. */
export const AGENT_ORDER: readonly AgentId[] = ['claude-code', 'codex', 'opencode'];

/**
 * Prefix for Command.note on commands that need a password, `sudo` or a Windows
 * administrator prompt. The prompt generator turns these into stop-and-ask steps.
 */
export const ADMIN_NOTE_PREFIX = 'Needs administrator rights';

/** The same prefix in the German dictionary (src/content/de). */
export const ADMIN_NOTE_PREFIX_DE = 'Braucht Administratorrechte';

/** True for a command note that marks an administrator step, in either language. */
export function isAdminNote(note: string | undefined): boolean {
  return !!note && (note.startsWith(ADMIN_NOTE_PREFIX) || note.startsWith(ADMIN_NOTE_PREFIX_DE));
}

export function adminNote(detail: string): string {
  return `${ADMIN_NOTE_PREFIX}: ${detail}`;
}

/** The selected agents, in picker order, optionally limited to `only`. */
export function selectedAgents(ctx: CommandContext, only?: readonly AgentId[]): AgentId[] {
  return AGENT_ORDER.filter((a) => ctx.agents.includes(a) && (!only || only.includes(a)));
}

/** `-a claude-code -a codex …` for the skills CLI (vercel-labs/skills, flag `-a, --agent`). */
export function agentFlags(ctx: CommandContext, only?: readonly AgentId[]): string {
  return selectedAgents(ctx, only)
    .map((a) => `-a ${a}`)
    .join(' ');
}

/**
 * `npx skills add <source> --skill … -g -a … -y`.
 * Flags verified against the vercel-labs/skills README (skills 1.7.0):
 * -g/--global, -a/--agent, -s/--skill, -y/--yes. No `--copy`: on Windows the CLI
 * creates a directory junction and falls back to copying on its own.
 */
export function skillsAdd(source: string, skills: readonly string[], only?: readonly AgentId[]) {
  return (ctx: CommandContext): string => {
    const parts = ['npx skills add', source];
    for (const s of skills) parts.push(`--skill ${s}`);
    parts.push('-g');
    const flags = agentFlags(ctx, only);
    if (flags) parts.push(flags);
    parts.push('-y');
    return parts.join(' ');
  };
}

/** ctx7 setup flag per agent (`npx ctx7 setup --help`, ctx7 0.5.12). */
export const CTX7_FLAG: Record<AgentId, string> = {
  'claude-code': '--claude',
  codex: '--codex',
  opencode: '--opencode',
};
