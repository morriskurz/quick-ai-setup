// STUB — replaced by content agent
// Signatures are frozen; implementations are placeholders.

import { agents, baselineStepIds, extras, goals, steps } from '../content';
import type { Command, CommandContext, Selection, SetupPlan, Step } from '../content/types';

/** Ordered, de-duplicated steps for a selection: baseline, agent installs, goals, extras. */
export function resolvePlan(selection: Selection): SetupPlan {
  // STUB — replaced by content agent
  const ids = [
    ...baselineStepIds,
    ...agents.filter((a) => selection.agents.includes(a.id)).map((a) => a.installStepId),
    ...goals.filter((g) => selection.goals.includes(g.id)).flatMap((g) => g.stepIds),
    ...extras.filter((e) => selection.extras.includes(e.id)).flatMap((e) => e.stepIds),
  ];
  const seen = new Set<string>();
  const out: Step[] = [];
  for (const id of ids) {
    const step = steps[id];
    if (!step || seen.has(id)) continue;
    if (step.agents && !step.agents.some((a) => selection.agents.includes(a))) continue;
    seen.add(id);
    out.push(step);
  }
  return { steps: out };
}

/** Resolve a Command to the literal shell text for this context. */
export function renderCommand(cmd: Command, ctx: CommandContext): string {
  // STUB — replaced by content agent
  return typeof cmd.run === 'function' ? cmd.run(ctx) : cmd.run;
}

/** The single copyable prompt for a coding agent. */
export function buildAgentPrompt(selection: Selection): string {
  // STUB — replaced by content agent
  const plan = resolvePlan(selection);
  return plan.steps.map((s, i) => `${i + 1}. ${s.title}`).join('\n');
}

/** AGENTS.md / CLAUDE.md content: global baseline and per-project template. */
export function buildAgentsMd(selection: Selection): { global: string; project: string } {
  // STUB — replaced by content agent
  void selection;
  return { global: '# AGENTS.md\n', project: '# AGENTS.md (project)\n' };
}

/** One script per OS that prints every installed version. */
export function buildVerifyScript(selection: Selection): string {
  // STUB — replaced by content agent
  void selection;
  return 'git --version';
}
