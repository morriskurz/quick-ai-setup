// Page copy that belongs to content rather than to components.
// English, owner's voice (first person): short, concrete, sentence case, sourced, no hype.
// COPY: owner review — everything in this file.

export const FORTUNE_URL =
  'https://fortune.com/2026/01/29/100-percent-of-code-at-anthropic-and-openai-is-now-ai-written-boris-cherny-roon/';

// COPY: owner review
export const heroCopy = {
  /** Two sentences, rendered on two lines. */
  headline: ['Stay at the frontier.', 'Use what works.'] as const,
  subline: 'Pick your goals. You get one prompt for your coding agent, or every command to run yourself.',
  body: [
    {
      text: 'At Anthropic and OpenAI, the engineers who build these tools say AI now writes all of their code. Across Anthropic, the share is 70 to 90 percent.',
      source: { label: 'Fortune, 29 January 2026', url: FORTUNE_URL },
    },
    {
      text: 'Most businesses are still at the setup stage: brokerages, trades, construction, tourism and hospitality, many of them family-run. This page handles the setup.',
    },
    {
      text: 'The hardest problem is unchanged: knowing what you want. So the first skill installed interviews you before anything gets built.',
    },
  ],
  primaryCta: 'Build my setup',
} as const;

// COPY: owner review
export const sectionCopy = {
  agent: {
    eyebrow: 'Step zero',
    title: 'Start with one coding agent. I recommend Claude Code.',
    intro: 'A coding agent reads your files, runs commands and writes changes on your computer, with your permission.',
    installNote: 'Install and sign in to your agent first, with the steps below. The prompt runs inside it.',
  },
  os: {
    title: 'Your computer',
    intro: 'Linux commands are for Debian and Ubuntu.',
  },
  goals: {
    eyebrow: 'Goals',
    title: 'Tick what you want to do. The setup follows.',
    intro: 'Always included: Git, Node.js, the grill-me skill, Context7 and the house rules.',
  },
  extras: {
    eyebrow: 'Extras',
    title: 'Two extras, off by default. Add them later.',
    intro: 'Both shorten output to save usage, and both make mistakes harder to spot.',
  },
  setup: {
    eyebrow: 'Your setup',
    title: 'Copy one prompt. Or run every step yourself.',
    intro: 'The agent installs everything in order, shows each command first and stops when it needs you.',
    copyPromptCta: 'Copy the prompt',
    humanStepLabel: 'You do this',
    commandStepLabel: 'Run this',
    docsLabel: 'Official docs',
  },
  houseRules: {
    title: 'House rules, written once. Read in every session.',
    intro:
      'The prompt appends the global rules to each agent’s instruction file; copy the project template into every new project as AGENTS.md and CLAUDE.md.',
    globalLabel: 'Global rules',
    projectLabel: 'Project template',
  },
  verify: {
    eyebrow: 'Verify',
    title: 'Check what is installed. The script changes nothing.',
    intro: 'Run it in a new terminal window. It prints each tool’s version or “not installed”.',
    copyCta: 'Copy the check',
  },
  notIncluded: {
    title: 'Not included: DuckDB',
    body: 'DuckDB queries many Excel files at once. Its skill pack lists Windows support as incomplete, so I left it out.',
    url: 'https://duckdb.org',
  },
} as const;

// COPY: owner review
export const securityCopy = {
  eyebrow: 'Before you copy',
  title: 'Read what it does. Then run it.',
  blocks: [
    {
      title: 'What the prompt does',
      body: 'It installs the tools under Your setup, adds the skills you ticked and appends the house rules to each agent’s instruction file, after a backup. It creates no accounts and enters no passwords: for sign-ups, sign-ins and your computer password it stops and asks you.',
    },
    {
      title: 'Read commands before you approve them',
      body: 'Your agent shows each command first. Ask three questions. Where does it download from? Every command here uses the vendor’s own domain, such as claude.ai, chatgpt.com, opencode.ai, astral.sh, vite.plus, github.com, npmjs.com or google.com. Does it need administrator rights? Then you run it yourself. Does it delete anything? Nothing here does; if you see rm, del or Remove-Item, ask why.',
    },
    {
      title: 'How your agent asks for permission',
      body: 'Check your agent’s mode before you paste the prompt.',
    },
  ],
  /** Verified 2026-09-23 against each vendor's docs. */
  permissionModes: [
    {
      agent: 'claude-code',
      label: 'Claude Code',
      body: 'Pro, Max and Team plans start in auto mode, where a second model reviews each action instead of you. For this setup, start it with claude --permission-mode default so every command waits for your yes. Shift+Tab switches modes.',
      url: 'https://code.claude.com/docs/en/permission-modes',
    },
    {
      agent: 'codex',
      label: 'Codex',
      body: 'By default it asks before using the network or writing outside the current folder. Installing does both, so expect to approve most steps. /permissions changes the mode.',
      url: 'https://developers.openai.com/codex/agent-approvals-security',
    },
    {
      agent: 'opencode',
      label: 'OpenCode',
      body: 'By default it runs commands and edits files without asking. Press Tab for the read-only plan agent, or set "bash": "ask" and "edit": "ask" under "permission" in opencode.json.',
      url: 'https://opencode.ai/docs/permissions/',
    },
  ],
  trust:
    'Skills are instructions your agent follows. These come from Anthropic, Cloudflare, Vercel Labs, the googleworkspace GitHub organisation and named authors. Anthropic’s document skills are source-available, not open source. The Google Workspace CLI states that it is not an officially supported Google product.',
} as const;
