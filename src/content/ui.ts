// Component chrome: labels, buttons, status and screen-reader text that is not page copy.
// English is the source of truth; the German entries live in ./de/ui.ts with the same shape.
// COPY: owner review

export const uiCopy = {
  /** document.title per language; index.html keeps the English one for link previews. */
  docTitle: 'Advanced AI setup for anyone · creativecodecampus',
  skipLink: 'Skip to the setup',
  nav: {
    label: 'Page sections',
    setup: 'Setup',
    security: 'Security',
    verify: 'Verify',
  },
  lang: {
    group: 'Language',
  },
  hero: {
    eyebrow: 'Advanced AI setup for anyone',
    secondaryCta: 'See every step',
    meta: ['Open source', 'Windows, macOS and Linux'],
  },
  newTab: ' (opens in a new tab)',
  steps: (n: number) => `${n} ${n === 1 ? 'step' : 'steps'}`,
  noAgent: 'No agent',
  output: {
    aside: 'Live output',
    heading: 'Your prompt',
    promptLabel: 'Generated prompt',
    show: 'Show the prompt',
    hide: 'Hide the prompt',
  },
  copy: {
    label: 'Copy',
    copied: 'Copied',
    failed: 'Copy failed',
    copiedStatus: 'Copied to the clipboard',
    failedStatus: 'Copy failed. Select the text and copy it by hand.',
  },
  docsFor: (docs: string, context: string) => `${docs} for ${context} (opens in a new tab)`,
  choose: {
    agentsLegend: 'Coding agents',
    recommended: 'recommended',
    keepOneAgent: 'Keep at least one agent selected.',
    detectedOs: 'Detected from your browser.',
  },
  goalsLegend: 'Goals',
  extras: {
    legend: 'Extras',
    note: 'Note',
    telemetryDetails: 'Telemetry details',
  },
  security: {
    count: (total: number, auto: number, human: number) =>
      `Your setup has ${total} ${total === 1 ? 'step' : 'steps'}: ${auto} the agent can run, ${human} you do yourself.`,
    permissionDocs: 'Permission docs',
    permissionDocsFor: (agent: string) => ` for ${agent} (opens in a new tab)`,
  },
  setup: {
    pathOne: 'Path one: copy the prompt',
    pathTwo: 'Path two: every step yourself',
    osTabs: 'Operating system for the steps',
  },
  step: {
    commandFor: (title: string) => `command for ${title}`,
    commandNFor: (n: number, title: string) => `command ${n} for ${title}`,
    scriptFor: (title: string) => `script for ${title}`,
    adminInline: 'Needs administrator rights: your computer asks for your password.',
    openHost: (host: string) => `Open ${host}`,
    seeHouseRules: 'See the house rules',
    noCommand: (os: string) => `No command for ${os} here.`,
    followDocs: 'Follow the official docs',
    docsForStep: (title: string) => ` for ${title} (opens in a new tab)`,
    warning: 'Warning',
  },
  houseRules: {
    docsForAgent: (agent: string) => ` for ${agent} instruction files (opens in a new tab)`,
  },
  verify: {
    osTabs: 'Operating system for the verify script',
    context: 'verify script',
  },
  start: {
    exampleContext: 'grill-me example',
  },
  consulting: {
    photoPlaceholder: 'Photo',
  },
  footer: {
    licence: 'Code under the MIT licence. Content © creativecodecampus, all rights reserved.',
    source: 'Source on GitHub',
  },
};

export type UiCopy = typeof uiCopy;
