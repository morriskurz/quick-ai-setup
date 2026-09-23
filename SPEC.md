# quick-ai-setup — Specification

Status: **approved and implemented** (2026-09-23). Section 11 records corrections made during implementation.
Date: 2026-09-23
Owner: morriskurz / creativecodecampus

---

## 1. What this is

A single-page site at `ai.creativecodecampus.com` that takes a non-technical business
user from "no AI setup" to "working AI coding setup" in one sitting.

The user ticks what they want to achieve. The site produces two paths to the same
end state:

1. **Copy one prompt** into a coding agent and let it do the work.
2. **Run the commands yourself**, step by step, with an explanation of each one.

The audience is explicitly not enterprise engineers. It is people in brokerages,
trades, construction, tourism, hospitality — often family-run — who are behind the
AI adoption wave because their business is people-centric and low-tech, not because
they lack the need.

The site's thesis, in the owner's own words: staying at the frontier does not mean
chasing every release. It means getting the most value out of systems that work.

---

## 2. Decisions locked in this interview

| Area | Decision |
|---|---|
| Design system | creativecodecampus, from the claude.ai design-system project (see §9 blocker) |
| Stack | Vite + React + Tailwind |
| Hosting | Cloudflare **Workers** (Static Assets), custom domain `ai.creativecodecampus.com` |
| Language | English first; German after content review |
| Repo | `morriskurz/quick-ai-setup`, public |
| License | MIT for code, content rights reserved |
| Page structure | One scrolling page, sticky live output panel |
| Motion | Restrained, built with the `emil-design-eng` and `animate` skills |
| State | `localStorage` only, not URL-encoded |
| Checklist shape | Two flat sections: **Goals** and **Extras** |
| Agent picker | `claude-code`, `codex`, `opencode` |
| Config files | Both `AGENTS.md` and `CLAUDE.md` as real duplicated files (no symlink) |
| Config scope | Global baseline, plus a per-project template (see §6) |
| Human steps | Prompt path: agent pauses and asks. Manual path: signup steps written inline |
| Windows | Native PowerShell + winget |
| Verification | One copyable verify script per OS |
| Security | Dedicated section immediately above the copy button |
| Copy | Drafted by Claude in the owner's voice, owner edits before publication |

---

## 3. Page structure

Single scroll. Sticky output panel on the right (desktop) / bottom sheet (mobile).

1. **Hero** — the thesis. Short. No marketing language.
2. **Step zero: your coding agent** — Claude Code as the opinionated recommendation,
   Codex and OpenCode named as alternatives. The agent picker lives here and feeds
   the `-a` flags in every generated command.
3. **Goals** — pick what you want to achieve.
4. **Extras** — optional, off by default.
5. **Security** — what the prompt will do, how to read commands before running them,
   how permission modes work. Sits above the copy button.
6. **Your setup** — the generated prompt, plus the manual step-by-step walkthrough
   with an OS tab switcher (Windows / macOS / Linux).
7. **Verify** — one script per OS that prints every installed version.
8. **Consulting** — the owner's photo and a call to book a call. Offer: AI-readiness
   consulting for founders and companies — advanced habits, a knowledge system, and
   team setup beyond what this page covers. Credibility comes from the owner's own
   startup software experience. The photo follows the brand's single rule for
   photography: graded cool and dark, under the same vignette and grain. No circle crop.

### Live output panel

Updates as boxes are ticked. Contains the generated agent prompt and a copy button.
Showing cause and effect is the point: ticking a goal visibly changes the output.

---

## 4. Checklist content

### Universal baseline (always included, not togglable)

| Tool | Why |
|---|---|
| Git | Revert changes, keep versions — for documents too, not only code |
| Node.js v24 LTS | Runtime, and `npx` for installing skills |
| `grill-me` skill | Get interviewed about what you actually want, so you get what you want |
| Context7 MCP | Live, version-correct library docs, so the agent stops inventing functions that do not exist |
| `AGENTS.md` + `CLAUDE.md` | House rules the agent follows in every session |

### Goals

| Goal | Pulls in |
|---|---|
| Version control for non-code work | Git basics, document-versioning walkthrough |
| Build websites | Vite+ (`vp`) + Vite + React, Cloudflare account + Workers, `cloudflare/skills`, `emilkowalski/skills` |
| Build apps | Flutter + Dart |
| Build data pipelines | uv + Python |
| Browser automation | Claude in Chrome extension, `agent-browser` |
| Work in my existing programs | Office file skills (docx/xlsx/pptx/pdf), Google Workspace CLI + `gws-*` skills, Chrome connection |

"Build websites" and everything under Development also require a **GitHub account**
and the **`gh` CLI**. The account alone makes GitHub storage; `gh` is what lets the
agent create the repo, open pull requests, and read why CI failed
(`gh run view --log-failed`).

### Extras (off by default)

| Extra | Note shown on the page |
|---|---|
| RTK | Shortens tool output to save tokens. **Discloses telemetry** to `telemetry.rtk-ai.app` and the opt-out. |
| Caveman | Makes answers more concise; can be harder to read. |

Both carry an explicit warning: output compression makes mistakes harder to spot.
Best added after a few weeks, not on day one.

---

## 5. Verified commands

Everything below was verified on 2026-09-23. Sources and rejected candidates in
[RESEARCH.md](RESEARCH.md).

### Skills CLI

Package is literally `skills` (vercel-labs, MIT). Real flags:
`-g/--global`, `-a/--agent <agents...>`, `-s/--skill <skills...>`, `-y/--yes`,
`--all`, `--copy`, `-l/--list`.

There is **no** `--agents`, `--ci`, or `--no-interactive`.

```bash
npx skills add emilkowalski/skills --skill emil-design-eng -g -a claude-code -a codex -a opencode -y
```

**Windows uses `--copy`.** `skills add` symlinks by default, and native Windows needs
developer mode for symlinks. This is also why `AGENTS.md` and `CLAUDE.md` ship as two
real files rather than a symlink pair.

### Per-OS installs

| Tool | Windows (winget) | macOS | Linux |
|---|---|---|---|
| Git | `winget install --id Git.Git -e` | `brew install git` | `sudo apt-get install git` |
| Node LTS (v24.21.0) | `winget install --id OpenJS.NodeJS.LTS -e` | `brew install node@24` | nvm install script |
| uv | `winget install --id astral-sh.uv -e` | `brew install uv` | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| gh | `winget install --id GitHub.cli` | `brew install gh` | GitHub apt keyring |
| Vite+ | `irm https://vite.plus/ps1 \| iex` | `curl -fsSL https://vite.plus \| bash` | same as macOS |
| Dart | `winget install --id Google.DartSDK -e` | `brew tap dart-lang/dart && brew install dart` | bundled with Flutter |
| Flutter | **no winget package** — manual zip + PATH | `brew install --cask flutter` | tarball + PATH |

### Context7

`@upstash/context7-mcp` 4.1.1 (2026-09-14), `ctx7` CLI 0.5.12 (2026-09-22).
Universal baseline — it helps whatever the reader is building.

```bash
npx ctx7 setup --claude --codex --opencode
```

Pass only the flags matching the agents ticked in the picker. **No API key is
required** — the free anonymous tier works, which matters for a page whose readers
should not be collecting credentials on day one.

Why it is baseline rather than an extra: a beginner cannot tell a hallucinated
function from a real one. Context7 injects current, version-specific docs into the
prompt and is the single biggest reduction in that failure mode.

The install path changed recently — it used to be a `claude mcp add` line. Link the
docs next to the command block rather than trusting this to stay correct.

### GitHub CLI

`gh` v2.101.0 (2026-09-15). Install row is in the table above. One-time setup:

```bash
gh auth login
```

The site recommends the **CLI only**. The GitHub MCP server is deliberately excluded:
it needs a personal access token and consumes context for no beginner payoff.

### Google Workspace

`googleworkspace/cli` — official Google, Apache-2.0, 113 skills. This is the only
credible email answer in the skills ecosystem.

```bash
npx skills add googleworkspace/cli --skill gws-gmail --skill gws-gmail-send \
  --skill gws-sheets --skill gws-docs --skill gws-calendar --skill gws-drive \
  -g -a claude-code -a codex -a opencode -y
gws auth setup
```

**This resolves the Google auth fork in favour of the skills**, not Anthropic's
first-party connectors. The reason is coverage: the skills work across all three
agents in the picker, while connectors are Claude-only and would strand Codex and
OpenCode readers.

The cost of that choice: `gws auth setup` requires a Google Cloud project and an
OAuth consent screen. This is the hardest step on the entire page and the most
likely place for a non-technical reader to give up. It needs a screenshot
walkthrough, or an explicit "do this once with whoever handles your IT" box.

Release cadence is unclear — tagged release v0.22.5 is 2026-03-31 while the repo was
pushed 2026-09-17. Link the docs rather than pinning a version.

### agent-browser

`vercel-labs/agent-browser` v0.38.1 (2026-09-16), MIT.

```bash
npm i -g agent-browser
agent-browser install
npx skills add vercel-labs/agent-browser -g -a claude-code -a codex -a opencode -y
```

`agent-browser install` downloads its own Chrome — a second browser on the machine,
hundreds of MB. Research flagged this as dev-grade for the target audience and the
owner kept it deliberately. The page should state the download up front so it is not
a surprise mid-install.

Per-agent MCP wiring is undocumented upstream; use the skill, not `agent-browser mcp`.

### Vite+

`viteplus.dev` is real: the Vite+ unified toolchain from VoidZero, MIT licensed,
currently in beta. It is a **toolchain** (`vp` wrapping Vite, Vitest, Rolldown,
Oxlint), not a framework. The site must describe it accurately as such. The web
development path is `vp` managing a Vite + React app.

### Cloudflare

Cloudflare now steers new projects to Workers — its own Pages page says to start new
projects with Workers. The site recommends **Workers with Static Assets**, and this
repo deploys the same way.

Free tier: 100,000 requests/day, 10 ms CPU per request, static assets unmetered.

Skills: `npx skills add https://github.com/cloudflare/skills`.

---

## 6. AGENTS.md / CLAUDE.md

Generated from the ticked checklist. Written as two real files with identical content.

Resolving the contradiction raised during the interview — a global file generated
from today's goals goes stale the moment the user picks up a new goal, and
project-specific rules like "use uv" should not apply to every project:

- **Global file** gets only universal rules: verify before claiming done, actually run
  the code, state assumptions, plan before acting.
- **Per-project template** gets the goal-specific rules and is handed to the user as a
  copyable block to drop into each new project.

The source is a curated subset of the owner's own rules. Personal entries — the
orchestrator role, the `@RTK.md` import, the self-improvement section — are excluded
unless RTK is ticked in Extras.

---

## 7. The generated prompt

Targets the agents in the picker. Contains only what an agent can genuinely do:
install toolchains, install skills, write config files, scaffold a project.

Account creation cannot be automated. GitHub, Cloudflare, and agent login are human
steps. In the prompt path the agent is instructed to stop and ask. In the manual path
the signup steps are written inline where they belong.

---

## 8. Voice

English, in the owner's register: analytical, plain, sourced, no marketing language.
Claims that can be checked get a link. The framing is value from working systems, not
tool accumulation.

German translation happens after the English content is reviewed and settled.

---

## 9. Open blockers

1. **Design tokens.** The design source is a claude.ai design-system project, readable
   only through the `/design-sync` skill, which only the owner can start. Required
   before any styling work begins.
2. **Bash sandbox is broken** in this session — every command fails with
   `apply-seccomp: write /proc/self/setgroups ... Permission denied`. Workable by
   disabling the sandbox per command, but it prompts constantly. Fix with `/sandbox`
   from an interactive `claude` terminal.
3. **Windows commands are untestable** from this Linux machine. Every PowerShell and
   winget command ships verified against vendor documentation only. The owner should
   test on real Windows before launch. The Flutter manual-zip path is the highest risk.
4. **DNS.** `ai.creativecodecampus.com` exists on Cloudflare and needs configuring.
   Owner's step.
5. **Flutter version drift** — docs say stable 3.47.3, the Homebrew cask says 3.47.5.
   Pin a version at build time or link rather than quote.

---

## 10. Build order

1. Owner runs `/design-sync`; tokens extracted into Tailwind theme.
2. `gh repo create morriskurz/quick-ai-setup --public` (owner confirms first).
3. Scaffold Vite + React + Tailwind, Workers static-assets deploy config.
4. Content model: goals, extras, tools, per-OS commands as typed data, not JSX.
5. Checklist and live prompt generation.
6. Step-by-step walkthrough with OS tabs.
7. Motion pass using `emil-design-eng` and `animate`.
8. Verify scripts per OS.
9. Security section.
10. Deploy to Workers, connect the domain.
11. German pass, after English content review.

---

## 11. Implementation corrections (2026-09-23)

Found while implementing `src/content` and `src/lib`. Sources are in the step `docsUrl`s and
the content draft. These replace the matching statements above.

1. **Context7 is a human step.** `npx ctx7 setup` always runs a browser sign-in at
   context7.com (device code, then Enter) unless `--api-key`/`--oauth` is passed. The prompt
   stops and asks. §5's "No API key is required" is wrong for this command.
2. **Google Workspace CLI is not official Google.** The README says "not an officially
   supported Google product". The binary installs with `npm install -g @googleworkspace/cli`,
   the skills need `gws-shared`, and `gws auth setup` needs the `gcloud` CLI, so `gcloud` is
   installed first. The manual Cloud Console route is the fallback. `-s gmail,calendar,drive,docs,sheets`
   was verified in the gws source (`docs` → `documents`, `sheets` → `spreadsheets`).
3. **RTK telemetry is opt-in and off by default.** Per rtk-ai/rtk `docs/TELEMETRY.md` and
   `src/core/telemetry.rs`, nothing is sent without consent. The consent prompt comes during
   `rtk init`. Opt-out: `rtk telemetry disable` or `RTK_TELEMETRY_DISABLED=1`. The endpoint
   host is compiled in and not published.
4. **No `--copy` on Windows.** skills 1.7.0 creates a junction on Windows and copies if that
   fails.
5. **No separate Dart install.** Dart ships with Flutter.
6. **Node belongs to the baseline.** nvm (`nvm install --lts`) on macOS and Linux, winget
   `OpenJS.NodeJS.LTS` on Windows. Vite+ is installed with `VP_NODE_MANAGER=no VP_PM_MANAGER=no
   VP_PNPM_MANAGER=yes`, so it keeps that Node and provides pnpm. That is documented for the
   bash installer; the PowerShell form is inferred.
7. **Claude in Chrome is Claude Code only.** agent-browser is for every agent and is
   Apache-2.0, not MIT.
8. **The Fortune claim is narrower than written.** Individual top engineers at Anthropic and
   OpenAI say about 100%. Anthropic's company-wide figure is 70–90%.
9. **Admin steps are stop-and-ask.** Any `sudo`, Windows administrator prompt or Homebrew
   install is either a human step or a STOP in the prompt.
10. **New Windows human step.** `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
    is needed because Windows clients default to Restricted, which blocks the npm `.ps1` shims
    (`npx`, `gws`, `agent-browser`).
11. **Global instruction files.** Claude Code reads `~/.claude/CLAUDE.md`, Codex reads
    `~/.codex/AGENTS.md`, OpenCode reads `~/.config/opencode/AGENTS.md`. The Windows paths for
    Codex and OpenCode are inferred. Codex does not read `CLAUDE.md`.

- **House rules (2026-09-23, owner decision):** the global instruction file is now the owner's own `~/.claude/CLAUDE.md` verbatim (minus the `@RTK.md` import), replacing the curated subset described in §6.
