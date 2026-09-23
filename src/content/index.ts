// Content entry point. Step data lives in ./steps/*; this file assembles it and
// re-exports the names the UI and generator import.
// Sources and verification notes: SPEC.md "Implementation corrections" and the
// content draft; every Step carries its own docsUrl.

import { agentSteps } from './steps/agents';
import { baselineSteps } from './steps/baseline';
import { extraSteps } from './steps/extras';
import { goalSteps } from './steps/goals';
import type { Step } from './types';

export { agentLoginStepIds, agents, globalInstructionFiles } from './steps/agents';
export { NVM_VERSION } from './steps/baseline';
export { extras, HOUSE_RULES_STEP_ID, RTK_TELEMETRY_DOCS, VERIFY_STEP_ID } from './steps/extras';
export { FLUTTER_VERSION, goals } from './steps/goals';
export { ADMIN_NOTE_PREFIX } from './helpers';
export { heroCopy, sectionCopy, securityCopy } from './copy';

const allSteps: Step[] = [...baselineSteps, ...agentSteps, ...goalSteps, ...extraSteps];

export const steps: Record<string, Step> = Object.fromEntries(allSteps.map((s) => [s.id, s]));

if (Object.keys(steps).length !== allSteps.length) {
  throw new Error('Duplicate step id in src/content/steps');
}

/** Baseline steps that run before the coding agents are installed. */
export const baselineBeforeAgentIds: string[] = ['powershell-scripts', 'homebrew', 'git', 'node'];

/** Baseline steps that need an installed, signed-in agent (skills go into its folder). */
export const baselineAfterAgentIds: string[] = ['context7', 'grill-me'];

/** Every baseline step id, in plan order (agent installs slot in between the two groups). */
export const baselineStepIds: string[] = [...baselineBeforeAgentIds, ...baselineAfterAgentIds];
