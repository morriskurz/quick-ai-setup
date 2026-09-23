// House rules: the text written to AGENTS.md / CLAUDE.md.
// GLOBAL_RULES_BODY is the owner's own global CLAUDE.md below its heading, verbatim (his choice,
// 2026-09-23). CLAUDE.md keeps his heading; AGENTS.md files get a neutral one.
// The @RTK.md import is left out: `rtk init` adds its own reference when RTK is ticked.
// COPY: owner's file — change only when he changes his own.

import type { GoalId, Selection } from './types';

/** First line of the global file: the owner's own heading in CLAUDE.md, a neutral one in AGENTS.md. */
export const CLAUDE_MD_HEADING = '# CLAUDE.md — Working Rules';
export const AGENTS_MD_HEADING = '# Working Rules';

/** The owner's file below its heading, verbatim. */
export const GLOBAL_RULES_BODY = `
## Workflow Rules
- **Always run/execute code after making changes** — don't just syntax-check; actually run the script to verify it works end-to-end, so errors can be caught and fixed immediately
- **Reread your task plan** and **reread the relevant files to the task** before continuing

## Role
- You are the orchestrator. Never do work yourself. Spawn teams of subagents for every task. Your job is to think, plan & coordinate. Subagents execute.

## User Preferences
- **Use pnpm or bun** where possible instead of npm
- **Use uv** for python
- **Abstraction litmus test**: Before writing an abstraction, ask: "What concrete problem does this solve right now?" If the answer is "well, if we ever need to…" — you don't need it.

## Verification Protocol
Before delivering ANY result, complete this 5-step checklist:
1. **Re-read your output** — Does it match what was asked? Check task scope.
2. **Verify data accuracy** — Cross-check numbers, URLs, dates, usernames against source material or logs.
3. **Validate all claims** — If you made assertions, verify each one. Mark unverified claims \`[needs verification]\`.
4. **File integrity check** — If you created/modified files, re-read them. Validate formatting, syntax, completeness.
5. **Test execution** — If you ran code/scripts, verify output matches expectations. Check exit codes and logs.

## Robust Results in One Pass
- **Plan before acting** — Outline approach first, execute second. Ask clarifying questions BEFORE starting.
- **Track multi-part tasks** — Use todo lists to avoid missing components.
- **State assumptions** — When requirements are ambiguous, implement the most likely interpretation AND note what you assumed.
- **Test incrementally** — Verify at each step, not only at the end. Don't batch problems.
- **Diagnose errors immediately** — If a tool fails, diagnose before retrying. After 3 failures, switch approaches.
- **Short sessions over marathons** — Commit progress to files frequently. Start new sessions for new tasks. At 90% context, quality degrades.

## Research and Facts
- **Search before claiming** — For facts that may have changed, search current data rather than relying on training knowledge.
- **Cite sources** — Include source URLs/references for factual claims.
- **Distinguish sources clearly** — Label whether information is from training vs. current search.
- **Handle conflicts** — When data conflicts, present both versions. Don't hide discrepancies.
- **Save data** - If you used data in a data analysis, it needs to be reproducible. That means the source must be clear and the data available locally.

## Documents and Files
- **Save to workspace** — All deliverables go to the workspace folder, not temp directories.
- **Use appropriate formats** — .docx for documents, .xlsx for data, .pptx for presentations, .md for notes.
- **Build iteratively** — Outline structure first, fill content second for long documents.
- **Verify before closing** — Re-read files after creation. Check for syntax errors, incomplete sections, broken links.

## When Things Go Wrong
- **Diagnose, don't retry blindly** — Understand the error before retrying.
- **Alternative approaches** — After 3 failures on the same tool/approach, switch methods.
- **Verify outcomes** — Don't assume success. Test/verify the result explicitly.
- **Never say "done"** — Only claim completion after verification step completes successfully.

## Self-Improvement
- If you make a recurring mistake, add a rule here to prevent it next time.
- This file is a living document — update it as patterns emerge.
`;

/** Added to the global file only when the RTK extra is selected. */
export const RTK_RULE = `
## RTK
- RTK shortens shell output. If output looks cut off or wrong, run the command again as \`rtk proxy <command>\` for the full output.
`;

export const PROJECT_HEADER = `# Project rules

<!-- One or two sentences: what this project is and who it is for. -->
`;

export const PROJECT_EMPTY = `
## Working in this project
- Commit after every meaningful change, saying what changed and why.
`;

/** Per-goal fragments for the per-project template, in goal order. */
export const PROJECT_FRAGMENTS: Record<GoalId, (selection: Selection) => string> = {
  'docs-versioning': () => `
## Versions
- Commit after every meaningful change, saying in plain language what changed and why (for example "Offer: payment terms changed to 30 days at client's request").
- Never rewrite or delete history. To undo something, make a new commit that reverses it.
- Keep drafts and final versions in the same file; Git keeps the history.
`,
  websites: () => `
## Websites
- Use pnpm, not npm. Never run \`corepack enable\`.
- This is a Vite + React app managed by Vite+ (\`vp\`). Use \`vp dev\`, \`vp build\` and \`vp check\`, not the underlying tools.
- Deploy to Cloudflare Workers with static assets, using \`wrangler\`. Do not use Cloudflare Pages.
- Follow the emil-design-eng skill for layout, spacing and motion. Check pages at phone and desktop width.
- Keep secrets out of the repository: in \`.env\` (listed in \`.gitignore\`) or Cloudflare's secret store.
`,
  apps: () => `
## Apps
- This is a Flutter app. Run \`flutter analyze\` and \`flutter test\` before calling a change done.
- Test a feature on at least one real target (a phone or the desktop build) before calling it finished.
`,
  'data-pipelines': () => `
## Data pipelines
- Use uv for Python, never pip directly: \`uv add\` for libraries, \`uv run\` for scripts.
- Every script must be reproducible: someone else runs one command and gets the same result.
- Save input data in the project (for example in \`data/raw/\`) with its source and date. Never overwrite raw data; write results to a separate folder.
`,
  'browser-automation': (selection) => `
## Browser automation
- Use agent-browser for browser tasks (\`agent-browser --help\` lists the commands).${
    selection.agents.includes('claude-code')
      ? ' In Claude Code you may use Claude in Chrome instead when I am signed in to the site.'
      : ''
  }
- Never enter passwords, payment details or one-time codes. Stop and ask me to do it.
- Ask before submitting a form, sending a message or confirming a purchase.
`,
  'existing-programs': () => `
## Office files and Google Workspace
- For Word, Excel, PowerPoint and PDF, use the docx, xlsx, pptx and pdf skills and produce real files, not text copies.
- Keep the original file untouched; save your version under a new name.
- For Gmail, Calendar, Drive, Docs and Sheets, use the \`gws\` CLI through the gws skills.
- Show me every email or calendar invite and wait for my yes before sending. Never delete mail or files.
`,
};
