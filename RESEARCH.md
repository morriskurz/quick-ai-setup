# Tool research — verified 2026-09-23

Findings for the quick-ai-setup recommendation list. Audience: non-technical
business users (brokerages, trades, construction, tourism, hospitality).
Target agents: `claude-code`, `codex`, `opencode`.

Every version and date below was checked on 2026-09-23. GitHub release pages omit
the current year, so bare dates are 2026. Items marked UNVERIFIED are not
publishable without a recheck — see §4.

---

## 1. Recommended — these earn a place on the page

| Tool | Version | Install | Why |
|---|---|---|---|
| **`gh` CLI** | v2.101.0, 2026-09-15 | `winget install GitHub.cli` / `brew install gh` / apt+dnf repo at `cli.github.com/packages` | `gh auth login` once unlocks repo creation, PRs, and `gh run view --log-failed` so the agent reads its own CI failures. **CLI only — skip the GitHub MCP server** (PAT setup plus context bloat, no beginner payoff). |
| **Context7 MCP** | `@upstash/context7-mcp` 4.1.1, 2026-09-14; `ctx7` CLI 0.5.12, 2026-09-22 | `npx ctx7 setup` (`--claude`, `--codex`, `--opencode`) | Injects current, version-specific library docs. API key optional, free tier keyless. The single biggest cure for an agent calling APIs that no longer exist. Install this first. |
| **Chrome DevTools MCP** | 1.9.0, 2026-09-08, ~1.03M weekly downloads | `claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest` | Uses the Chrome they already have — no browser download. Answers "is it broken, why is it slow, did the form submit" with console and network evidence. |
| **DuckDB** | v1.5.5, 2026-07-22 (LTS 1.4.5) | `winget install DuckDB.cli` (needs MSVC Redist) / `brew install duckdb` / `curl https://install.duckdb.org \| bash` | Reads `.xlsx` directly: `INSTALL excel; LOAD excel; SELECT * FROM 'kunden.xlsx';`. Turns "our data lives in 40 Excel files" into one query. |
| **duckdb-skills** | 9 skills, published 2026-09-16 | `npx skills add duckdb/duckdb-skills -g -a claude-code -a codex -a opencode -y` | Official DuckDB skill pack. **Its README says Windows support is incomplete** — see §3. |
| **markitdown** | v0.1.8, 2026-09-21, 186.5K★ | `uv tool install 'markitdown[all]'` | The missing front door. PDF, Word, Excel, PowerPoint, images (OCR) and audio (transcription) into Markdown *for LLMs*. This audience's data lives in exactly those formats. Ships an official `markitdown-mcp`. |
| **Anthropic document skills** | — | `npx skills add https://github.com/anthropics/skills --skill docx -g -a codex -a opencode -y` | `docx`, `xlsx`, `pdf`, `pptx`, plus `frontend-design` (913.5K installs, the registry's most-installed skill). **See the sync rule in §2.** |
| **Google Workspace skills** | `googleworkspace/cli`, Apache-2.0, 31,110★, 113 skills, 3.2M installs | `npx skills add googleworkspace/cli --skill gws-gmail …` | The largest business-relevant source in the registry. `gws-gmail` (76.8K) is the only credible email answer in the whole skills ecosystem. Picks: `gws-gmail`, `gws-gmail-send`, `gws-sheets`, `gws-docs`, `gws-calendar`, `gws-drive`. **Auth is the hard part — see §3.** |

> **Correction (2026-09-23, implementation pass).** `googleworkspace/cli` lives in Google's
> googleworkspace GitHub org, but its README says it is "not an officially supported Google
> product"; the `gws` binary installs separately (`npm install -g @googleworkspace/cli`) and the
> skills also need `gws-shared`. Context7: `npx ctx7 setup` always runs a browser sign-in
> (device code), so "free tier keyless" applies only to manual MCP configs. Details in SPEC.md
> "Implementation corrections".

### Secondary, worth naming

| Tool | Version | Install | Note |
|---|---|---|---|
| **LibreOffice headless** | 26.8.0 Community, 2026-08-26 | `sudo apt install libreoffice` / `brew install --cask libreoffice` | `soffice --headless --convert-to pdf --outdir /home/user *.doc`. Batch Office to PDF with no cloud, no upload, no subscription. macOS binary lives at `/Applications/LibreOffice.app/Contents/MacOS/soffice`. |
| **pandoc** | 3.11, 2026-08-29, 46.4K★ | `brew install pandoc`; use the `.deb` from GitHub releases on Linux — distro packages lag badly | Lets the agent produce a real `.docx` from Markdown. |
| **excel-mcp-server** | haris-musa, v0.1.8, 2026-04-12, 4,196★, MIT | `claude mcp add-json "excel" '{"command":"uvx","args":["excel-mcp-server","stdio"]}'` | No OAuth, no API key, no Excel installation required. **stdio transport only** — the last release patched a path-traversal issue in SSE/HTTP. |
| **marimo** | 0.24.2, 2026-09-11 | `uv add marimo`, then `marimo edit nb.py` | Preferred over Jupyter. Stored as plain `.py`: git-diffable, no hidden state, deterministic order, so all three target agents can edit it as code. Official MCP (`--mcp --no-token`) and skill (`npx skills add marimo-team/marimo-pair`). |
| **Anthropic connectors** | Docs updated 2026-08-17 | `claude.ai/customize/connectors` | Gmail, Google Calendar, Drive, Microsoft 365. The real email answer for Claude users. **Constraints in §3.** |

---

## 2. Rules the research implies for the page itself

1. **The skills sync split.** On Claude Code signed in with a Claude account, `pdf`
   and `xlsx` sync automatically into `~/.claude/skills/synced/`. Codex and
   OpenCode have no sync and do need `npx skills add`. The generated command must
   branch on the agent, or it tells Claude Code users to install what they have.
2. **Never print `corepack enable`.** Corepack is removed from Node 25+, and the
   Node 26 LTS due this autumn has none. pnpm's own docs say not to use it.
3. **A docs link beside every command block.** Four of these install commands
   changed within the last six months — spec-kit, BMAD, Context7, and n8n's MCP.
   Hardcode them all and the page is wrong by Christmas.
4. **Licence line for Anthropic skills.** Anthropic labels them
   "source-available, not open source." Worth one sentence before telling readers
   to push them into Codex and OpenCode.

---

## 3. Open decisions and warnings

**The Google auth fork — must be resolved.** Two tracks of very different difficulty:

- `gws-*` skills work across all three target agents, but `gws auth setup` needs a
  Google Cloud project and an OAuth consent screen. A family brokerage will not
  get through that unaided.
- Anthropic connectors are a click at `claude.ai/customize/connectors`, but are
  Claude-only and useless to Codex and OpenCode readers.

Pick one per agent track. Listing both side by side strands readers halfway
through the Google Cloud console.

**Anthropic connectors do not support local OAuth from Claude Code.** Users must
connect on the web first; they then appear in `/mcp`. The Microsoft 365 connector
is read/search only and work/school accounts only.

**DuckDB's skill pack flags incomplete Windows support**, and the site's Windows
path is native PowerShell plus winget. Either warn loudly or drop DuckDB from the
Windows track.

**Vite+ is at v1.0.0-rc.0, not GA** (2026-09-22). It does *not* replace the package
manager — `vp add/remove/update` selects whichever the project already uses. Its
licence reportedly reversed from commercial to MIT; confirm before publishing any
"it's free" claim. Building a beginner page on RC software is a live risk.

---

## 4. Rejected, with reasons

| Item | Why not |
|---|---|
| **gitleaks / trufflehog** | GitHub push protection for users is on by default for all public-repo pushes (since Feb/Mar 2024) and blocks live AWS, Stripe and GitHub keys with zero setup. The scanners are a three-tool install chain for a solved problem. The real beginner control is `.gitignore` for `.env` plus keeping client repos private. |
| **BMAD-METHOD** | v6.12.0. Needs a terminal, Node 20+, a git project, and comfort reading generated PRDs. A family firm wanting a booking page does not need scrum ceremony. Note: the analyst/PM/architect persona framing in most write-ups describes v4 and is stale. |
| **spec-kit** | v1.0.10, 2026-09-22. More approachable than BMAD — one six-command loop, GitHub-backed — but still second-page material. |
| **Self-hosted n8n** | Docker plus domain plus reverse proxy plus TLS renewal plus Postgres plus an encryption key you must never lose plus tested backups plus 1.x→2.x upgrade breakage, on a system holding live credentials. Point at n8n Cloud or skip. Also **Sustainable Use License, not open source**: internal use fine, reselling or hosting for clients is not. |
| **ccusage** | Superseded for this audience. Claude Code's built-in `/usage` shows session cost, plan-limit bars, and attribution by skill, subagent, plugin and MCP server. Only useful for cross-tool history spanning Codex and OpenCode. |
| **Jupyter** | `.ipynb` is JSON with embedded outputs: noisy diffs, hidden execution state. Claude Code's `NotebookEdit` copes; Codex and OpenCode do not. |
| **Playwright MCP** | First run downloads hundreds of MB of browser binaries — a wall for a first-timer. Chrome DevTools MCP covers the need. |
| **agent-browser** | Real (vercel-labs, 43k★, v0.38.1) and good, but dev-grade and downloads a second Chrome. |
| **docling** | v2.130.0. Stronger structured PDF extraction than markitdown, but pulls torch and heavy ML dependencies. Built for RAG engineers. |
| **qsv / csvkit / visidata** | qsv is redundant with DuckDB. csvkit is 9 months stale (2.2.0, 2025-12-15). visidata is an interactive human TUI — wrong shape for an agent. |
| **`GongRzhe/Gmail-MCP-Server`** | **Archived**, last push 2025-08-06, yet still tops most listicles. Flag it as a trap. |
| **Google's own Workspace MCP** | Developer Preview. The Gmail server has `create_draft` but **no send tool**. |
| **Microsoft Agent 365** | Requires a full M365 Copilot licence at $15/user/month. |
| **`dukaworks/office-cli`** | Markets itself as "the first and best Office suite purpose-built for AI agents." GitHub shows 0 stars, 0 forks, no releases, last push 2026-08-04. Ranks well in search; evidence is vaporware-grade. |
| **German bookkeeping MCPs** | BuchPilot, sevDesk, Lexoffice wrappers, DATEV. Community-only, and pointing a non-technical user's agent at live accounting data is a bad default. |

---

## 5. UNVERIFIED — recheck before publishing

- BMAD v6.12.0's release **year** (inferred from a bare "September 4").
- **pnpm 12.5.1 vs 12.6.0** — npm's tag and endoflife.date disagree.
- **DuckDB v1.5.5 / 2026-07-22** — the release page called it "a bug fix release
  for issues after v1.4.4," which is inconsistent with a 1.5.5 tag.
- Whether `duckdb-skills` installs cleanly on **Codex and OpenCode** — its README
  is Claude-Code-framed.
- **Vite+'s licence reversal** to MIT — three secondary sources, no primary post.
- `googleworkspace/cli` release cadence — tagged release v0.22.5 is 2026-03-31
  while the repo was pushed 2026-09-17.
- Whether `read_csv_auto` is formally deprecated or merely undocumented.
- Context7's exact rate limits and paid pricing — not published anywhere readable.
- `brand-guidelines` and `doc-coauthoring` behaviour — names verified, contents
  not read.
- trufflehog having no winget package — absence of evidence, not proof.
- n8n 2.40.5's exact release date and its enterprise-feature licence carve-outs.
- markitdown's `uv tool install` form — upstream documents the `pip` equivalent.
- markitdown, pandoc and LibreOffice release dates came from a research agent's
  fetches, not direct verification.

---

## 6. Registry assessment

skills.sh is **not** an office-productivity marketplace. Trending on 2026-09-23:
ai-image-generation (38.9K), design-mobile-apps, ai-video-generation, video-edit,
ai-music, reddit-automation, plus a large Lark/Feishu enterprise-IM cluster.

Anthropic's four document skills, `frontend-design`, and Google's 113 `gws` skills
are approximately the **entire** non-technical-business surface of the ecosystem.
Everything else is developer tooling or AI media generation. Worth stating plainly
on the site — it sets honest expectations and is itself useful information.

`vercel-labs/agent-skills` is ~100% developer tooling; only `web-design-guidelines`
and `writing-guidelines` are worth showing, and only when the agent is building
the reader a website.
