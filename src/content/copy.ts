// Page copy that belongs to content rather than to components.
// English, owner's voice: plain, concrete, sentence case, sourced, no hype.
// COPY: owner review — everything in this file.

export const FORTUNE_URL =
  'https://fortune.com/2026/01/29/100-percent-of-code-at-anthropic-and-openai-is-now-ai-written-boris-cherny-roon/';

// COPY: owner review
export const heroCopy = {
  /** Two sentences, rendered on two lines. */
  headline: ['Stay at the frontier.', 'Use what works.'] as const,
  subline:
    'Staying at the frontier does not mean chasing every release and trying every tool. It means getting the most value out of systems that work. Tick what you want to do: you get one prompt for your coding agent, or the exact commands to run yourself.',
  body: [
    {
      text: 'At Anthropic and OpenAI, the engineers who build these tools say AI now writes all of their own code. Anthropic puts the share across the whole company at 70 to 90 percent.',
      source: { label: 'Fortune, 29 January 2026', url: FORTUNE_URL },
    },
    {
      text: 'Most businesses are still at the setup stage. This page is for brokerages, trades, construction, tourism and hospitality firms, many of them family-run. They are behind on AI because their work runs on people and relationships, not because they need it less. Setup is the part that stops most people, and setup is what this page takes care of.',
    },
    {
      text: 'The hardest problem has not changed: knowing what you actually want. That is why the first skill installed is one that interviews you before anything gets built.',
    },
  ],
  primaryCta: 'Build my setup',
} as const;

// COPY: owner review
export const sectionCopy = {
  agent: {
    eyebrow: 'Step zero',
    title: 'Start with one coding agent. We recommend Claude Code.', // COPY: owner review — headline rewritten to the brand's two-sentence form
    intro:
      'A coding agent is a program that reads your files, runs commands and writes changes on your computer, with your permission. You talk to it in plain language. We recommend Claude Code. Codex and OpenCode work too; a few tools on this page only work with Claude Code, and the page adjusts when you pick.',
    installNote:
      'Install and sign in to your agent first, with the commands below. The prompt only works once the agent is running and signed in.',
  },
  os: {
    title: 'Your computer',
    intro: 'Commands differ by system. Linux commands are written for Debian and Ubuntu.',
  },
  goals: {
    eyebrow: 'Goals',
    title: 'Tick what you want to do. The setup follows.', // COPY: owner review — was a question; brand headlines never are
    intro:
      'Pick as many as you like. Git, Node.js, the grill-me skill, Context7 and a house rules file are always included, because every goal needs them.',
  },
  extras: {
    eyebrow: 'Extras',
    title: 'Two extras, off by default. Add them later.', // COPY: owner review — headline rewritten to the brand's two-sentence form
    intro:
      'Both make output shorter to save usage. Both also make mistakes harder to spot. Add them after a few weeks, once you know what normal output looks like.',
  },
  setup: {
    eyebrow: 'Your setup',
    title: 'Copy one prompt. Or run every step yourself.', // COPY: owner review — headline rewritten to the brand's two-sentence form
    intro:
      'Paste the prompt into your coding agent. It installs everything in order, shows each command before it runs it, and stops whenever it needs you. Or follow the steps yourself: every command has a line on why it is there and a link to its official documentation.',
    copyPromptCta: 'Copy the prompt',
    humanStepLabel: 'You do this',
    commandStepLabel: 'Run this',
    docsLabel: 'Official docs',
  },
  houseRules: {
    title: 'House rules, written once. Read in every session.', // COPY: owner review — headline rewritten to the brand's two-sentence form
    intro:
      'The prompt adds these rules to each agent’s global instruction file, after making a backup. The project template is for you: copy it into every new project as AGENTS.md and CLAUDE.md.',
    globalLabel: 'Global rules',
    projectLabel: 'Project template',
  },
  verify: {
    eyebrow: 'Verify',
    title: 'Check what is installed. The script changes nothing.', // COPY: owner review — headline rewritten to the brand's two-sentence form
    intro:
      'Run this in a new terminal window. It prints the version of every tool you picked, or “not installed”. It reads only and changes nothing.',
    copyCta: 'Copy the check',
  },
  notIncluded: {
    title: 'Not included: DuckDB',
    body: 'DuckDB queries many Excel files at once and is worth a look once you are comfortable. Its skill pack states that Windows support is incomplete, so it is not part of this setup.',
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
      body: 'It asks your agent to install the tools listed under Your setup, add the skills you ticked, and add the house rules to each agent’s instruction file, after backing up the existing one. It does not create accounts and it never enters passwords. When a step needs a sign-up, a sign-in or your computer password, the agent stops and asks you to do it.',
    },
    {
      title: 'Read commands before you approve them',
      body: 'Your agent shows each command before running it. Three questions are enough. Where does it download from? Every command here uses the vendor’s own domain, such as claude.ai, chatgpt.com, opencode.ai, astral.sh, vite.plus, github.com, npmjs.com or google.com. Does it ask for administrator rights? Then you run it yourself and know why. Does it delete anything? Nothing in this setup does; if you see rm, del or Remove-Item, ask why.',
    },
    {
      title: 'How your agent asks for permission',
      body: 'Each agent handles approval differently. Check which mode yours is in before you paste the prompt.',
    },
  ],
  /** Verified 2026-09-23 against each vendor's docs. */
  permissionModes: [
    {
      agent: 'claude-code',
      label: 'Claude Code',
      body: 'On Pro, Max and Team plans it starts in auto mode, where a second model reviews each action instead of you. For this setup, start it in Manual mode with claude --permission-mode default, so every command waits for your yes. Shift+Tab switches modes.',
      url: 'https://code.claude.com/docs/en/permission-modes',
    },
    {
      agent: 'codex',
      label: 'Codex',
      body: 'By default it works inside the current folder and asks before it uses the network or writes outside the folder. Installing tools does both, so expect to approve most steps. /permissions shows and changes the mode.',
      url: 'https://developers.openai.com/codex/agent-approvals-security',
    },
    {
      agent: 'opencode',
      label: 'OpenCode',
      body: 'By default it runs commands and edits files without asking. Press Tab to switch to the read-only plan agent and review the steps first, or set "bash": "ask" and "edit": "ask" under "permission" in opencode.json.',
      url: 'https://opencode.ai/docs/permissions/',
    },
  ],
  trust:
      'Skills are instructions your agent follows. The ones on this page come from Anthropic, Cloudflare, Vercel Labs, the googleworkspace GitHub organisation and named individual authors. Anthropic’s document skills are source-available, not open source. The Google Workspace CLI states that it is not an officially supported Google product.',
} as const;
