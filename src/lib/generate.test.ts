import { describe, expect, it } from 'vitest';
import {
  agentLoginStepIds,
  BACKUP_STEP_ID,
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
import { PROMPT_DE } from '../content/de/prompt';
import { buildAgentPrompt, buildAgentsMd, buildVerifyScript, needsAdmin, PROMPT_EN, renderCommand, resolvePlan } from './generate';

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
      // The house-rules step is 'human' for the manual path; in the prompt the agent writes it.
      const humans = resolvePlan(s).steps.filter((st) => st.kind === 'human' && st.id !== HOUSE_RULES_STEP_ID);
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

describe('getting started', () => {
  it('prompt ends by telling the user how to start with grill-me, per agent', () => {
    const claude = buildAgentPrompt(sel());
    expect(claude.trimEnd().split('\n').pop()).toContain('restart Claude Code in a project folder and type /grill-me');
    const codex = buildAgentPrompt(sel({ agents: ['codex'] }));
    expect(codex).toContain('"Use the grill-me skill:"');
    expect(codex).not.toContain('/grill-me');
  });
});

describe('buildAgentsMd', () => {
  it("global file is the owner's own CLAUDE.md, without the @RTK.md import", () => {
    const { global } = buildAgentsMd(sel());
    expect(global.startsWith('# CLAUDE.md — Working Rules')).toBe(true);
    expect(global).toContain('## Verification Protocol');
    expect(global).toContain('Mark unverified claims `[needs verification]`.');
    expect(global).not.toContain('@RTK.md');
    expect(global).not.toMatch(/RTK/);
  });

  it('AGENTS.md gets a neutral heading instead of the CLAUDE.md one', () => {
    const codexOnly = buildAgentsMd(sel({ agents: ['codex', 'opencode'] })).global;
    expect(codexOnly.startsWith('# Working Rules\n')).toBe(true);
    expect(codexOnly).not.toContain('CLAUDE.md');
    const mixedPrompt = buildAgentPrompt(sel({ agents: ['claude-code', 'codex'] }));
    expect(mixedPrompt).toContain('In AGENTS.md files, the first line is "# Working Rules"');
    expect(buildAgentPrompt(sel())).not.toContain('In AGENTS.md files');
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
    expect(prompt).toContain('Only you answer; an agent stops and asks you.');
  });

  it('every section headline is two sentences with full stops, never a question (brand rule)', () => {
    const titles = [
      sectionCopy.agent.title,
      sectionCopy.goals.title,
      sectionCopy.extras.title,
      sectionCopy.setup.title,
      sectionCopy.houseRules.title,
      // sectionCopy.verify.title is one sentence by the owner's choice.
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

describe('regressions from the second verification pass', () => {
  it('backs up every selected global instruction file before anything can modify it', () => {
    for (const os of OSES) {
      const s = sel({ os, agents: ALL_AGENTS, goals: ALL_GOALS, extras: ALL_EXTRAS });
      expect(ids(s)[0]).toBe(BACKUP_STEP_ID);
      const prompt = buildAgentPrompt(s);
      const backup = prompt.indexOf('Back up your agents’ instruction files');
      expect(backup).toBeGreaterThan(-1);
      for (const marker of ['ctx7 setup', 'rtk init', 'JuliusBrussee/caveman', 'Write the house rules']) {
        expect(prompt.indexOf(marker), `${os}:${marker}`).toBeGreaterThan(backup);
      }
      const backupCmd = renderCommand(steps[BACKUP_STEP_ID].commands![os]![0], { agents: ALL_AGENTS, os });
      for (const p of os === 'windows' ? ['.claude\\CLAUDE.md', '.codex\\AGENTS.md', '.config\\opencode\\AGENTS.md'] : ['.claude/CLAUDE.md', '.codex/AGENTS.md', '.config/opencode/AGENTS.md']) {
        expect(backupCmd, `${os}:${p}`).toContain(p);
      }
    }
  });

  it('backup never overwrites an earlier backup', () => {
    const linux = renderCommand(steps[BACKUP_STEP_ID].commands!.linux![0], { agents: ['codex'], os: 'linux' });
    expect(linux).toContain('[ ! -e');
    expect(linux).not.toContain('CLAUDE.md');
    const win = renderCommand(steps[BACKUP_STEP_ID].commands!.windows![0], { agents: ['codex'], os: 'windows' });
    expect(win).toContain('-not (Test-Path');
  });

  it('falls back to Claude Code when no agent is selected', () => {
    const empty = sel({ agents: [], goals: ['existing-programs'] });
    const prompt = buildAgentPrompt(empty);
    expect(prompt).toContain('Coding agents I use: Claude Code');
    expect(prompt).toContain('-a claude-code');
    expect(prompt).not.toMatch(/npx skills add \S+( --skill \S+)* -g -y/);
    expect(ids(empty)).toContain('install-claude-code');
    expect(buildVerifyScript(empty)).toContain('claude --version');
  });

  it('the document walkthrough can be done where it appears', () => {
    const step = steps['docs-walkthrough'];
    expect(step.human?.instructions).not.toMatch(/after the setup/i);
    expect(step.commands?.linux?.map((c) => c.run)).toEqual(['git init', 'git add .', 'git commit -m "Starting point"']);
    const order = ids(sel({ goals: ['docs-versioning'] }));
    expect(order.indexOf('git-identity')).toBeLessThan(order.indexOf('docs-walkthrough'));
  });

  it('the Python check cannot download Python', () => {
    for (const os of OSES) {
      const script = buildVerifyScript(sel({ os, goals: ['data-pipelines'] }));
      expect(script).toContain('--no-python-downloads');
      expect(script).not.toMatch(/uv'? .*'?run'?/);
    }
  });

  it('RTK for OpenCode says it installs only the OpenCode plugin', () => {
    expect(steps['rtk-init-opencode'].why).toContain('no Claude Code hook');
  });
});

describe('German prompt keeps every safety rule', () => {
  const full = (os: OsId): Selection => sel({ os, agents: ALL_AGENTS, goals: ALL_GOALS, extras: ALL_EXTRAS });
  /** The code blocks of a prompt: commands, scripts and files, which never change with the language. */
  const codeBlocks = (prompt: string) =>
    [...prompt.matchAll(/^( *)~~~(\w*)\n([\s\S]*?)\n\1~~~$/gm)].filter((m) => m[2] !== 'markdown').map((m) => m[3]);

  it('answers in German and has the same rules, in the same order', () => {
    const prompt = buildAgentPrompt(sel(), 'de');
    expect(prompt.split('\n')[0]).toContain('Antworten Sie mir auf Deutsch');
    expect(PROMPT_DE.rules).toHaveLength(PROMPT_EN.rules.length);
    for (const phrase of [
      'Zeigen Sie jeden Befehl, bevor Sie ihn ausführen, und sagen Sie in einem Satz, was er tut.',
      'Wechseln Sie nie eigenmächtig zu einem anderen Installer.',
      'Tippen, erfragen oder speichern Sie nie Passwörter, Tokens, Schlüssel oder Einmalcodes',
      'Wenn ein Schritt STOP sagt, halten Sie an.',
      'Führen Sie sudo- oder Administratorbefehle nie selbst aus. Zeigen Sie sie mir, STOP,',
      'Wartet ein Befehl auf eine Eingabe, die Sie nicht geben können, brechen Sie ihn ab und fragen Sie mich.',
      'Löschen Sie keine Dateien',
      'Fassen Sie kurz zusammen',
    ]) {
      expect(prompt, phrase).toContain(phrase);
    }
  });

  it('has a STOP for every human step, on every OS', () => {
    for (const os of OSES) {
      const s = full(os);
      const prompt = buildAgentPrompt(s, 'de');
      const humans = resolvePlan(s, 'de').steps.filter((st) => st.kind === 'human' && st.id !== HOUSE_RULES_STEP_ID);
      expect(humans.length).toBeGreaterThan(3);
      for (const h of humans) expect(prompt, `${os}:${h.id}`).toContain(`${h.title} — STOP`);
    }
  });

  it('turns every sudo or admin command into a stop-and-ask', () => {
    for (const os of OSES) {
      const s = sel({ os, goals: ALL_GOALS });
      const ctx = { agents: s.agents, os: s.os };
      const adminCount = resolvePlan(s, 'de')
        .steps.filter((st) => st.kind === 'command')
        .flatMap((st) => st.commands?.[os] ?? [])
        .filter((c) => needsAdmin(c, ctx)).length;
      const englishCount = buildAgentPrompt(s).match(/STOP: this needs administrator rights/g)?.length ?? 0;
      expect(adminCount, os).toBe(englishCount);
      expect(buildAgentPrompt(s, 'de').match(/STOP: Das braucht Administratorrechte/g)?.length ?? 0, os).toBe(adminCount);
    }
  });

  it('backs up before Context7, RTK, Caveman and the house rules', () => {
    for (const os of OSES) {
      const prompt = buildAgentPrompt(full(os), 'de');
      const backup = prompt.indexOf('Die Instruktionsdateien Ihrer Agenten sichern');
      expect(backup).toBeGreaterThan(-1);
      for (const marker of ['ctx7 setup', 'rtk init', 'JuliusBrussee/caveman', 'Schreiben Sie die Hausregeln']) {
        expect(prompt.indexOf(marker), `${os}:${marker}`).toBeGreaterThan(backup);
      }
    }
  });

  it('runs exactly the same commands as the English prompt', () => {
    for (const os of OSES) {
      for (const s of [full(os), sel({ os }), sel({ os, agents: ['codex'], goals: ['browser-automation'] })]) {
        expect(codeBlocks(buildAgentPrompt(s)).length).toBeGreaterThan(5);
        expect(codeBlocks(buildAgentPrompt(s, 'de'))).toEqual(codeBlocks(buildAgentPrompt(s)));
        expect(resolvePlan(s, 'de').steps.map((x) => x.id)).toEqual(ids(s));
      }
    }
  });

  it('ends by telling the user how to start with grill-me, per agent', () => {
    const claude = buildAgentPrompt(sel(), 'de');
    expect(claude.trimEnd().split('\n').pop()).toContain('Claude Code in einem Projektordner neu starten und /grill-me tippen');
    const codex = buildAgentPrompt(sel({ agents: ['codex'] }), 'de');
    expect(codex.trimEnd().split('\n').pop()).toContain('„Den grill-me-Skill verwenden:“');
    expect(codex).not.toContain('/grill-me');
  });

  it('keeps the RTK telemetry question with the user', () => {
    const prompt = buildAgentPrompt(sel({ agents: ALL_AGENTS, extras: ['rtk'] }), 'de');
    expect(prompt).toContain('Das beantworten nur Sie; ein Agent hält an und fragt Sie.');
  });

  it('uses the German template and keeps the owner’s rules English and verbatim', () => {
    const prompt = buildAgentPrompt(sel({ agents: ['claude-code', 'codex'], goals: ['websites'] }), 'de');
    expect(prompt).toContain('## Verification Protocol');
    expect(prompt).toContain('Übernehmen Sie sie wörtlich');
    expect(prompt).toContain('In AGENTS.md-Dateien lautet die erste Zeile „# Working Rules“');
    expect(prompt).toContain('# Projektregeln');
    expect(prompt).toContain('pnpm verwenden, nicht npm');
    expect(prompt).toContain('als AGENTS.md und CLAUDE.md kopieren');
  });

  it('refreshes PATH on Windows', () => {
    expect(buildAgentPrompt(sel({ os: 'windows' }), 'de')).toContain("GetEnvironmentVariable('Path','User')");
  });
});
