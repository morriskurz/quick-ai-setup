// House rules: the text written to AGENTS.md / CLAUDE.md.
// Source: a curated subset of the owner's own global CLAUDE.md (SPEC §6).
// Excluded on purpose: the orchestrator role, the @RTK.md import (rtk init adds
// its own reference), the self-improvement section, and anything developer-only.
// COPY: owner review — every rule below.

import type { GoalId, Selection } from './types';

export const GLOBAL_RULES_HEADING = '# Working rules';

export const GLOBAL_RULES = `${GLOBAL_RULES_HEADING}

## Before you start
- Plan before acting. For anything bigger than a small fix, outline the steps first and ask me about anything unclear before you start.
- State your assumptions. If a request can be read two ways, pick the most likely one and tell me which one you picked.

## While you work
- Actually run what you write. A script, a formula or a page is not done until you have run it and seen it work, not just checked that it looks right.
- If something fails, find out why before you try again. After three failed attempts with the same approach, stop and try a different one, or ask me.
- Keep sessions short. When a task is finished, save or commit the result and start a new session for the next task.

## Before you say "done"
- Re-read what I asked and check that your result answers it.
- Check every number, name, date and link against its source.
- Re-open any file you created or changed and check it is complete.
- Only say something is finished after you have verified it. If you could not verify something, say so.

## Facts
- For anything that may have changed recently, look it up instead of relying on memory.
- Give the source (a link or a file) for factual claims.
- If two sources disagree, show me both.
`;

/** Added to the global file only when the RTK extra is selected. */
export const RTK_RULE = `
## RTK
- RTK shortens the output of shell commands. If output looks cut off or a result does not make sense, run the command again as \`rtk proxy <command>\` to see the full, unfiltered output.
`;

export const PROJECT_HEADER = `# Project rules

<!-- One or two sentences: what this project is and who it is for. -->
`;

export const PROJECT_EMPTY = `
## Working in this project
- Commit after every meaningful change, with a message that says what changed and why.
`;

/** Per-goal fragments for the per-project template, in goal order. */
export const PROJECT_FRAGMENTS: Record<GoalId, (selection: Selection) => string> = {
  'docs-versioning': () => `
## Versions
- Commit after every meaningful change, with a message that says what changed and why in plain language (for example "Offer: payment terms changed to 30 days at client's request").
- Never rewrite or delete history. To undo something, make a new commit that reverses it.
- Keep drafts and final versions in the same file; Git keeps the history.
`,
  websites: () => `
## Websites
- Use pnpm, not npm. Never run \`corepack enable\`.
- The project is a Vite + React app managed by Vite+ (\`vp\`). Use \`vp dev\`, \`vp build\` and \`vp check\` instead of calling the underlying tools directly.
- Deploy to Cloudflare Workers with static assets, using \`wrangler\`. Do not use Cloudflare Pages for new projects.
- For layout, spacing and motion, follow the emil-design-eng skill. Check pages at phone width as well as desktop.
- Keep secrets out of the repository: they go in \`.env\` (listed in \`.gitignore\`) or in Cloudflare's secret store.
`,
  apps: () => `
## Apps
- This is a Flutter app. Use \`flutter\` and \`dart\` commands; run \`flutter analyze\` and \`flutter test\` before saying a change is done.
- Test on at least one real target (a phone, or the desktop build) before calling a feature finished.
`,
  'data-pipelines': () => `
## Data pipelines
- Use uv for Python. Never use pip directly. Add libraries with \`uv add\`, run scripts with \`uv run\`.
- Every script must be reproducible: someone else runs one command and gets the same result.
- Save the input data locally in the project (for example in \`data/raw/\`) and write down where it came from and when. Never overwrite raw data; write results to a separate folder.
`,
  'browser-automation': (selection) => `
## Browser automation
- Use agent-browser for browser tasks (run \`agent-browser --help\` for commands).${
    selection.agents.includes('claude-code')
      ? ' In Claude Code you may use Claude in Chrome instead when I am signed in to the site.'
      : ''
  }
- Never enter passwords, payment details or one-time codes. Stop and ask me to do it.
- Ask before submitting any form, sending a message or confirming a purchase.
`,
  'existing-programs': () => `
## Office files and Google Workspace
- For Word, Excel, PowerPoint and PDF files, use the docx, xlsx, pptx and pdf skills. Produce real files, not text copies.
- Keep the original file untouched; save your version under a new name.
- For Gmail, Calendar, Drive, Docs and Sheets, use the \`gws\` CLI through the gws skills.
- Always show me an email or calendar invite and wait for my yes before sending it. Never delete mail or files.
`,
};
