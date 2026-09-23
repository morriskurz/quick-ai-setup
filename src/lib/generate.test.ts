import { describe, expect, it } from 'vitest';
import {
  agentLoginStepIds,
  agents,
  baselineStepIds,
  extras,
  goals,
  HOUSE_RULES_STEP_ID,
  sectionCopy,
  securityCopy,
  steps,
  VERIFY_STEP_ID,
} from '../content';
import { splitTitle } from '../components/ui/headline';
import type { AgentId, OsId, Selection } from '../content/types';
import { buildAgentPrompt, buildAgentsMd, buildVerifyScript, needsAdmin, renderCommand, resolvePlan } from './generate';

const ALL_AGENTS: AgentId[] = ['claude-code', 'codex', 'opencode'];
const OSES: OsId[] = ['windows', 'macos', 'linux'];
const ALL_GOALS = goals.map((g) => g.id);
const ALL_EXTRAS = extras.map((e) => e.id);

const sel = (over: Partial<Selection> = {}): Selection => ({
  agents: ['claude-code'],
  goals: [],
  extras: [],
  os: 'linux',
  ...over,
});

const ids = (s: Selection) => resolvePlan(s).steps.map((x) => x.id);

/** Every rendered command for a plan, as one string. */
const allCommands = (s: Selection) =>
  resolvePlan(s)
    .steps.flatMap((st) => st.commands?.[s.os] ?? [])
    .map((c) => renderCommand(c, { agents: s.agents, os: s.os }))
    .join('\n');

describe('content integrity', () => {
  it('every step has an https docsUrl and matching id', () => {
    for (const [id, step] of Object.entries(steps)) {
      expect(step.id).toBe(id);
      expect(step.docsUrl, id).toMatch(/^https:\/\//);
      expect(step.why.length, id).toBeGreaterThan(20);
    }
  });

  it('every referenced step id exists', () => {
    const referenced = [
      ...baselineStepIds,
      ...agents.map((a) => a.installStepId),
      ...Object.values(agentLoginStepIds),
      ...goals.flatMap((g) => g.stepIds),
      ...extras.flatMap((e) => e.stepIds),
      HOUSE_RULES_STEP_ID,
      VERIFY_STEP_ID,
    ];
    for (const id of referenced) expect(steps[id], id).toBeDefined();
  });

  it('human steps carry instructions', () => {
    for (const step of Object.values(steps)) {
      if (step.kind === 'human') expect(step.human?.instructions, step.id).toBeTruthy();
    }
  });

  it('command steps have commands for every OS they apply to (except verify)', () => {
    for (const step of Object.values(steps)) {
      if (step.kind !== 'command' || step.id === VERIFY_STEP_ID) continue;
      expect(step.commands, step.id).toBeDefined();
    }
  });

  it('never ships --copy, corepack, or pip install', () => {
    for (const os of OSES) {
      const text = allCommands(sel({ os, agents: ALL_AGENTS, goals: ALL_GOALS, extras: ALL_EXTRAS }));
      expect(text).not.toContain('--copy');
      expect(text).not.toContain('corepack');
      expect(text).not.toMatch(/\bpip install\b/);
    }
  });

  it('has no separate Dart install', () => {
    expect(Object.keys(steps).some((id) => /dart/i.test(id))).toBe(false);
    expect(allCommands(sel({ goals: ['apps'], os: 'windows' }))).not.toContain('DartSDK');
  });
});

describe('renderCommand', () => {
  it('returns string commands unchanged', () => {
    expect(renderCommand({ run: 'git --version' }, { agents: ['claude-code'], os: 'linux' })).toBe('git --version');
  });

  it('calls function commands with the context', () => {
    const cmd = { run: ({ os }: { os: string }) => `echo ${os}` };
    expect(renderCommand(cmd, { agents: [], os: 'windows' })).toBe('echo windows');
  });
});

describe('resolvePlan', () => {
  it('orders baseline, agents, goals, extras, house rules, verify', () => {
    const order = ids(sel({ agents: ['claude-code', 'codex'], goals: ['websites'], extras: ['caveman'] }));
    const pos = (id: string) => order.indexOf(id);
    expect(pos('git')).toBeLessThan(pos('node'));
    expect(pos('node')).toBeLessThan(pos('install-claude-code'));
    expect(pos('install-claude-code')).toBeLessThan(pos('install-codex'));
    expect(pos('install-codex')).toBeLessThan(pos('login-claude-code'));
    expect(pos('login-codex')).toBeLessThan(pos('context7'));
    expect(pos('grill-me')).toBeLessThan(pos('gh'));
    expect(pos('emil-skills')).toBeLessThan(pos('caveman'));
    expect(order.at(-2)).toBe(HOUSE_RULES_STEP_ID);
    expect(order.at(-1)).toBe(VERIFY_STEP_ID);
  });

  it('de-duplicates steps shared by several goals', () => {
    const order = ids(sel({ goals: ['websites', 'apps', 'data-pipelines', 'docs-versioning'] }));
    expect(order.filter((id) => id === 'gh')).toHaveLength(1);
    expect(order.filter((id) => id === 'git-identity')).toHaveLength(1);
    expect(new Set(order).size).toBe(order.length);
  });

  it('is stable regardless of selection order', () => {
    const a = ids(sel({ agents: ['codex', 'claude-code'], goals: ['apps', 'websites'] }));
    const b = ids(sel({ agents: ['claude-code', 'codex'], goals: ['websites', 'apps'] }));
    expect(a).toEqual(b);
  });

  it('includes OS-specific steps only on their OS', () => {
    expect(ids(sel({ os: 'macos' }))).toContain('homebrew');
    expect(ids(sel({ os: 'linux' }))).not.toContain('homebrew');
    expect(ids(sel({ os: 'windows' }))).toContain('powershell-scripts');
    expect(ids(sel({ os: 'macos' }))).not.toContain('powershell-scripts');
  });

  it('drops Claude in Chrome when only Codex is selected', () => {
    const s = sel({ agents: ['codex'], goals: ['browser-automation', 'existing-programs'] });
    expect(ids(s)).not.toContain('claude-in-chrome');
    expect(ids(s)).toContain('agent-browser');
    expect(ids(sel({ agents: ['claude-code'], goals: ['browser-automation'] }))).toContain('claude-in-chrome');
  });

  it('adds only the selected agents’ installs and sign-ins', () => {
    const order = ids(sel({ agents: ['opencode'] }));
    expect(order).toContain('install-opencode');
    expect(order).toContain('login-opencode');
    expect(order).not.toContain('install-claude-code');
    expect(order).not.toContain('login-codex');
  });
});

describe('agent flags', () => {
  it('skills commands carry -a flags for exactly the selected agents', () => {
    const s = sel({ agents: ['claude-code', 'opencode'] });
    const text = allCommands(s);
    expect(text).toContain('npx skills add vechain/vechain-ai-skills --skill grill-me -g -a claude-code -a opencode -y');
    expect(text).not.toContain('-a codex');
  });

  it('context7 flags follow the selection', () => {
    expect(allCommands(sel({ agents: ['codex', 'opencode'] }))).toContain('npx ctx7 setup --codex --opencode --mcp');
  });

  it('RTK init steps follow the selection', () => {
    const order = ids(sel({ agents: ['codex'], extras: ['rtk'] }));
    expect(order).toContain('rtk-init-codex');
    expect(order).not.toContain('rtk-init-claude-code');
  });
});

describe('Claude Code office-skill sync rule', () => {
  it('Claude Code gets docx and pptx only', () => {
    const text = allCommands(sel({ agents: ['claude-code'], goals: ['existing-programs'] }));
    expect(text).toContain('npx skills add anthropics/skills --skill docx --skill pptx -g -a claude-code -y');
    expect(text).not.toContain('--skill pdf');
    expect(text).not.toContain('--skill xlsx');
  });

  it('Codex and OpenCode get all four, without claude-code in the flags', () => {
    const text = allCommands(sel({ agents: ALL_AGENTS, goals: ['existing-programs'] }));
    expect(text).toContain(
      'npx skills add anthropics/skills --skill docx --skill xlsx --skill pptx --skill pdf -g -a codex -a opencode -y',
    );
    expect(text).toContain('--skill docx --skill pptx -g -a claude-code -y');
  });

  it('includes gws-shared with the Google Workspace skills', () => {
    expect(allCommands(sel({ goals: ['existing-programs'] }))).toContain('--skill gws-shared');
  });
});

describe('buildAgentPrompt', () => {
  it('has a STOP for every human step, on every OS', () => {
    for (const os of OSES) {
      const s = sel({ os, agents: ALL_AGENTS, goals: ALL_GOALS, extras: ALL_EXTRAS });
      const prompt = buildAgentPrompt(s);
      const humans = resolvePlan(s).steps.filter((st) => st.kind === 'human');
      expect(humans.length).toBeGreaterThan(3);
      for (const h of humans) expect(prompt, `${os}:${h.id}`).toContain(`${h.title} — STOP`);
    }
  });

  it('turns every sudo or admin command into a stop-and-ask', () => {
    const s = sel({ os: 'linux', goals: ALL_GOALS });
    const ctx = { agents: s.agents, os: s.os };
    const adminCount = resolvePlan(s)
      .steps.filter((st) => st.kind === 'command')
      .flatMap((st) => st.commands?.linux ?? [])
      .filter((c) => needsAdmin(c, ctx)).length;
    expect(adminCount).toBeGreaterThan(0);
    const prompt = buildAgentPrompt(s);
    expect(prompt.match(/STOP: this needs administrator rights/g)?.length).toBe(adminCount);
  });

  it('states the selection, backs up before merging, forbids secrets, ends with verify', () => {
    const s = sel({ os: 'macos', agents: ['claude-code', 'codex'], goals: ['websites'], extras: ['rtk'] });
    const prompt = buildAgentPrompt(s);
    expect(prompt).toContain('macOS');
    expect(prompt).toContain('Claude Code, Codex');
    expect(prompt).toContain('Build websites');
    expect(prompt).toContain('RTK');
    expect(prompt).toMatch(/backup/i);
    expect(prompt).toContain('~/.claude/CLAUDE.md');
    expect(prompt).toContain('~/.codex/AGENTS.md');
    expect(prompt).not.toContain('~/.config/opencode/AGENTS.md');
    expect(prompt).toMatch(/Never type, ask for or store passwords/);
    expect(prompt).toMatch(/show it and say in one sentence what it does/);
    expect(prompt.indexOf('Check the setup')).toBeGreaterThan(prompt.indexOf('Write the house rules'));
    expect(prompt).toContain('v Codex codex --version');
    expect(prompt.lastIndexOf('Check the setup')).toBeGreaterThan(prompt.lastIndexOf('npx skills add'));
  });

  it('uses Windows paths and PATH refresh on Windows', () => {
    const prompt = buildAgentPrompt(sel({ os: 'windows' }));
    expect(prompt).toContain('$env:USERPROFILE\\.claude\\CLAUDE.md');
    expect(prompt).toContain("GetEnvironmentVariable('Path','User')");
  });
});

describe('buildAgentsMd', () => {
  it('global file has universal rules and no personal entries', () => {
    const { global } = buildAgentsMd(sel());
    expect(global).toContain('Actually run what you write');
    expect(global).not.toMatch(/orchestrator/i);
    expect(global).not.toContain('@RTK.md');
    expect(global).not.toMatch(/RTK/);
  });

  it('adds the RTK rule only when RTK is selected', () => {
    expect(buildAgentsMd(sel({ extras: ['rtk'] })).global).toContain('rtk proxy');
    expect(buildAgentsMd(sel({ extras: ['caveman'] })).global).not.toContain('rtk');
  });

  it('project template contains only the selected goals’ fragments', () => {
    const { project } = buildAgentsMd(sel({ goals: ['data-pipelines'] }));
    expect(project).toContain('Use uv for Python');
    expect(project).not.toContain('pnpm');
    expect(buildAgentsMd(sel({ goals: ['websites'] })).project).toContain('Use pnpm');
  });

  it('mentions Claude in Chrome only for Claude Code users', () => {
    expect(buildAgentsMd(sel({ agents: ['codex'], goals: ['browser-automation'] })).project).not.toContain('Chrome');
    expect(buildAgentsMd(sel({ agents: ['claude-code'], goals: ['browser-automation'] })).project).toContain(
      'Claude in Chrome',
    );
  });
});

describe('buildVerifyScript', () => {
  it('bash script lists only selected tools', () => {
    const script = buildVerifyScript(sel({ os: 'linux', agents: ['codex'], goals: ['data-pipelines'] }));
    expect(script.startsWith('#!/usr/bin/env bash')).toBe(true);
    expect(script).toContain('v Codex codex --version');
    expect(script).toContain('v uv uv --version');
    expect(script).not.toContain('claude --version');
    expect(script).not.toContain('flutter');
    expect(script).not.toContain('rtk');
    expect(script).toContain('not installed');
  });

  it('PowerShell script on Windows, tolerant of missing tools', () => {
    const script = buildVerifyScript(sel({ os: 'windows', goals: ['apps'], extras: ['rtk'] }));
    expect(script).toContain('Show-Version');
    expect(script).toContain("'Flutter' 'flutter'");
    expect(script).toContain("'RTK' 'rtk'");
    expect(script).toContain('not installed');
    expect(script).not.toContain('#!/usr/bin/env bash');
    expect(script).not.toContain("'gws'");
  });
});

describe('regressions found in verification', () => {
  it('Homebrew uses the brew.sh form, not a pipe into bash (a non-TTY stdin makes install.sh abort on sudo)', () => {
    const text = allCommands(sel({ os: 'macos' }));
    expect(text).toContain('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
    expect(text).not.toMatch(/Homebrew\/install\/HEAD\/install\.sh \| bash/);
  });

  it('never tells the agent to answer the RTK telemetry question itself', () => {
    const prompt = buildAgentPrompt(sel({ agents: ALL_AGENTS, extras: ['rtk'] }));
    expect(prompt).not.toContain('Answer yourself');
    expect(prompt).toContain('Only you answer that question: an agent stops and asks you.');
  });

  it('every section headline is two sentences with full stops, never a question (brand rule)', () => {
    const titles = [
      sectionCopy.agent.title,
      sectionCopy.goals.title,
      sectionCopy.extras.title,
      sectionCopy.setup.title,
      sectionCopy.houseRules.title,
      sectionCopy.verify.title,
      securityCopy.title,
    ];
    for (const t of titles) {
      expect(t, t).not.toContain('?');
      const { lead, gradient } = splitTitle(t);
      expect(lead.endsWith('.'), t).toBe(true);
      expect(gradient?.endsWith('.'), t).toBe(true);
    }
  });
});
