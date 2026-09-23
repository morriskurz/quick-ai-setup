// House rules: the text written to AGENTS.md / CLAUDE.md.
// Source: a curated subset of the owner's own global CLAUDE.md (SPEC §6).
// Excluded on purpose: the orchestrator role, the @RTK.md import (rtk init adds
// its own reference), the self-improvement section, and anything developer-only.
// COPY: owner review — every rule below.

import type { GoalId, Selection } from './types';

export const GLOBAL_RULES_HEADING = '# Working rules';

export const GLOBAL_RULES = `${GLOBAL_RULES_HEADING}

## Before you start
- Plan first. For anything bigger than a small fix, outline the steps and ask me about anything unclear.
- State your assumptions. If a request can be read two ways, pick the likelier one and tell me which.

## While you work
- Actually run what you write. A script, formula or page is done only when you have run it and seen it work.
- If something fails, find out why before retrying. After three failed attempts with one approach, switch approach or ask me.
- Keep sessions short. Save or commit finished work and start a new session for the next task.

## Before you say "done"
- Re-read my request and check your result answers it.
- Check every number, name, date and link against its source.
- Re-open every file you created or changed and check it is complete.
- Call something finished only after verifying it. If you could not verify it, say so.

## Facts
- Look up anything that may have changed recently instead of relying on memory.
- Cite the source (a link or a file) for factual claims.
- If sources disagree, show me both.
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
