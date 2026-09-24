/**
 * Frozen content contract for quick-ai-setup.
 * Content, generator and UI agents all build against these types — do not change
 * them without coordinating across all three.
 */

/** Page language. English is the source of truth; German is a dictionary over the same ids. */
export type Lang = 'en' | 'de';

export type AgentId = 'claude-code' | 'codex' | 'opencode';
export type OsId = 'windows' | 'macos' | 'linux';
export type GoalId =
  | 'docs-versioning'
  | 'websites'
  | 'apps'
  | 'data-pipelines'
  | 'browser-automation'
  | 'existing-programs';
export type ExtraId = 'rtk' | 'caveman';

/** Everything the reader has ticked on the page. */
export interface Selection {
  agents: AgentId[];
  goals: GoalId[];
  extras: ExtraId[];
  os: OsId;
}

/** The subset of a Selection a command needs to render itself. */
export interface CommandContext {
  agents: AgentId[];
  os: OsId;
}

export interface Command {
  /** Shell text, or a function of the selection (e.g. skills `-a` flags, Windows `--copy`). */
  run: string | ((ctx: CommandContext) => string);
  note?: string;
}

export interface Step {
  id: string;
  title: string;
  /** Plain-language explanation in the owner's voice. */
  why: string;
  /** 'command' = something an agent or user runs; 'human' = signup/manual action an agent cannot do. */
  kind: 'command' | 'human';
  commands?: Partial<Record<OsId, Command[]>>;
  human?: { instructions: string; url?: string };
  /** Official docs link shown beside every command block. Required. */
  docsUrl: string;
  /** Restrict to these agents; undefined = applies regardless of agent. */
  agents?: AgentId[];
  warning?: string;
}

export interface AgentOption {
  id: AgentId;
  label: string;
  recommended: boolean;
  summary: string;
  installStepId: string;
}

export interface Goal {
  id: GoalId;
  label: string;
  summary: string;
  stepIds: string[];
}

export interface Extra {
  id: ExtraId;
  label: string;
  summary: string;
  warning: string;
  stepIds: string[];
}

/** Ordered, de-duplicated list of steps for a Selection. */
export interface SetupPlan {
  steps: Step[];
}
