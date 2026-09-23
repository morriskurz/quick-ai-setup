// Which version checks the verify script runs for each step in the plan.
// Keyed by step id; buildVerifyScript keeps only the steps in the reader's plan.

export interface VersionCheck {
  label: string;
  /** Program name; looked up on PATH before running. */
  bin: string;
  /** Arguments; defaults to ['--version']. */
  args?: string[];
}

export const versionChecks: Record<string, VersionCheck[]> = {
  'install-claude-code': [{ label: 'Claude Code', bin: 'claude' }],
  'install-codex': [{ label: 'Codex', bin: 'codex' }],
  'install-opencode': [{ label: 'OpenCode', bin: 'opencode' }],
  git: [{ label: 'Git', bin: 'git' }],
  node: [
    { label: 'Node.js', bin: 'node' },
    { label: 'npm', bin: 'npm' },
  ],
  gh: [{ label: 'GitHub CLI', bin: 'gh' }],
  'vite-plus': [
    { label: 'Vite+', bin: 'vp' },
    { label: 'pnpm', bin: 'pnpm' },
  ],
  flutter: [
    { label: 'Flutter', bin: 'flutter' },
    { label: 'Dart', bin: 'dart' },
  ],
  uv: [{ label: 'uv', bin: 'uv' }],
  // `uv python find` only looks for an installed interpreter; --no-python-downloads rules out
  // uv's automatic download (docs.astral.sh/uv/concepts/python-versions).
  python: [
    { label: 'Python', bin: 'uv', args: ['python', 'find', '--no-project', '--show-version', '--no-python-downloads'] },
  ],
  'agent-browser': [{ label: 'agent-browser', bin: 'agent-browser' }],
  gws: [{ label: 'gws', bin: 'gws' }],
  gcloud: [{ label: 'gcloud', bin: 'gcloud' }],
  rtk: [{ label: 'RTK', bin: 'rtk' }],
};
