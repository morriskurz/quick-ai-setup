// German page copy, component chrome and consulting text. Same shape as the English
// objects in ../copy.ts, ../ui.ts and components/consulting.ts (the types enforce it).
// Informal "du" (owner decision 2026-09-24); the owner speaks as "ich". COPY: owner review — everything in this file.

import type { heroCopy, sectionCopy, securityCopy, startCopy } from '../copy';
import type { AgentId } from '../types';
import type { UiCopy } from '../ui';

/** A const object with every string literal widened to string: same keys, any text. */
export type Widen<T> = T extends string ? string : T extends (...args: never[]) => unknown ? T : T extends object ? { readonly [K in keyof T]: Widen<T[K]> } : T;

export const heroCopyDe: Widen<typeof heroCopy> = {
  headline: ['An der Frontier bleiben.', 'Nutzen, was funktioniert.'],
  subline: 'Kuratiert, nicht vollständig: die Skills, CLIs und die Instruktionsdatei, die ich selbst nutze.',
  primaryCta: 'Mein Setup erstellen',
};

export const sectionCopyDe: Widen<typeof sectionCopy> = {
  agent: {
    title: 'Beginne mit einem Coding-Agenten. Ich empfehle Claude Code.',
    intro: 'Ein Coding-Agent liest deine Dateien, führt Befehle aus und schreibt Änderungen auf deinem Computer, mit deiner Erlaubnis.',
    installNote: 'Installiere zuerst deinen Agenten und melde dich an, mit den Schritten unten. Der Prompt läuft darin.',
  },
  os: {
    title: 'Dein Computer',
    intro: 'Die Linux-Befehle gelten für Debian und Ubuntu.',
  },
  goals: {
    title: 'Kreuz an, was du vorhast. Das Setup folgt.',
    intro: 'Immer dabei: Git, Node.js, der grill-me-Skill, Context7 und die Hausregeln.',
  },
  extras: {
    title: 'Zwei Extras, standardmäßig aus. Ergänze sie später.',
    intro: 'Beide kürzen die Ausgabe, um Nutzung zu sparen, und bei beiden fallen Fehler schwerer auf.',
  },
  setup: {
    title: 'Kopiere einen Prompt. Oder führe jeden Schritt selbst aus.',
    intro: 'Der Agent installiert alles der Reihe nach, zeigt jeden Befehl vorher und hält an, wenn er dich braucht.',
    copyPromptCta: 'Prompt kopieren',
    humanStepLabel: 'Das machst du',
    commandStepLabel: 'Ausführen',
    docsLabel: 'Anleitung',
  },
  houseRules: {
    title: 'Hausregeln, einmal geschrieben. In jeder Sitzung gelesen.',
    intro:
      'Der Prompt hängt die globalen Regeln an die Instruktionsdatei jedes Agenten an; die Projektvorlage kopierst du in jedes neue Projekt als AGENTS.md und CLAUDE.md.',
    globalLabel: 'Globale Regeln',
    projectLabel: 'Projektvorlage',
  },
  verify: {
    title: 'Prüfe, was installiert ist.',
    intro: 'Führe es in einem neuen Terminal-Fenster aus. Es gibt die Version jedes Tools aus oder „not installed“.',
    copyCta: 'Prüfung kopieren',
  },
};

/** permissionModes: only the German body per agent; agent id, label and URL stay in the English data. */
export const securityCopyDe: Omit<Widen<typeof securityCopy>, 'permissionModes'> & {
  permissionModes: Record<AgentId, string>;
} = {
  title: 'Lies, was es tut. Dann führ es aus.',
  blocks: [
    {
      title: 'Was der Prompt tut',
      body: 'Er installiert die Tools aus deinem Setup, fügt die gewählten Skills hinzu und hängt die Hausregeln an die Instruktionsdatei jedes Agenten an, nach einem Backup. Er legt keine Konten an und gibt keine Passwörter ein: Bei Registrierung, Anmeldung und deinem Computer-Passwort hält er an und fragt dich.',
    },
    {
      title: 'Befehle lesen, bevor du zustimmst',
      body: 'Dein Agent zeigt jeden Befehl vorher. Stell drei Fragen. Woher lädt er herunter? Jeder Befehl hier nutzt die eigene Domain des Herstellers, etwa claude.ai, chatgpt.com, opencode.ai, astral.sh, vite.plus, github.com, npmjs.com oder google.com. Braucht er Administratorrechte? Dann führst du ihn selbst aus. Löscht er etwas? Nichts hier tut das; siehst du rm, del oder Remove-Item, frag nach dem Grund.',
    },
    {
      title: 'Wie dein Agent um Erlaubnis fragt',
      body: 'Prüfe den Modus deines Agenten, bevor du den Prompt einfügst.',
    },
  ],
  permissionModes: {
    'claude-code':
      'Pro-, Max- und Team-Pläne starten im Auto-Modus, in dem ein zweites Modell jede Aktion prüft, nicht du. Starte Claude Code für dieses Setup mit claude --permission-mode default, dann wartet jeder Befehl auf dein Ja. Shift+Tab wechselt den Modus.',
    codex:
      'Standardmäßig fragt Codex, bevor es das Netzwerk nutzt oder außerhalb des aktuellen Ordners schreibt. Installieren tut beides, rechne also damit, die meisten Schritte zu bestätigen. /permissions ändert den Modus.',
    opencode:
      'Standardmäßig führt OpenCode Befehle aus und bearbeitet Dateien, ohne zu fragen. Drück Tab für den schreibgeschützten Plan-Agenten, oder setz "bash": "ask" und "edit": "ask" unter "permission" in opencode.json.',
  },
  trust:
    'Skills sind Anweisungen, denen dein Agent folgt. Diese stammen von Anthropic, Cloudflare, Vercel Labs, der GitHub-Organisation googleworkspace und namentlich genannten Autoren. Die Dokument-Skills von Anthropic sind source-available, nicht Open Source. Die Google Workspace CLI gibt selbst an, kein offiziell unterstütztes Google-Produkt zu sein.',
};

export const startCopyDe: Widen<typeof startCopy> = {
  eyebrow: 'So fängst du an',
  title: 'Starte deinen Agenten neu. Dann sag, was du willst.',
  intro:
    'Öffne ein Terminal in einem Projektordner und starte deinen Agenten. Tippe /grill-me und dahinter, was du erreichen willst: Er befragt dich zuerst und baut dann.',
  example: '/grill-me Ein wöchentlicher Verkaufsbericht aus meinen Excel-Exporten',
  otherAgents: 'Codex und OpenCode: Tippe „Nutze den grill-me-Skill:“ und dahinter, was du willst.',
};

/** Text fields of components/consulting.ts; links, photo and sizes stay in the English config. */
export const consultingDe = {
  lead: 'Das Setup ist Schritt eins.',
  gradient: 'Gewohnheiten machen es dauerhaft.',
  body: 'Ich helfe Gründern und Teams weiter: fortgeschrittene Gewohnheiten, ein Wissenssystem, ein Setup für das ganze Team. Das erste Gespräch ist kostenlos und enthält einen AI-Readiness-Check.',
  photoAlt: 'Morris Kurz an seinem Schreibtisch',
  role: 'Gründer · Karlsruhe',
  bio: 'Vier Jahre Mitgründer und CTO von hey circle; davor erklärbare Machine-Learning-Modelle für eine Schweizer Privatbank. Heute messe ich, was KI in der Softwareentwicklung tatsächlich verändert.',
  cta: 'Kostenlosen AI-Readiness-Check buchen',
};

export const uiCopyDe: UiCopy = {
  docTitle: 'Fortgeschrittenes KI-Setup für alle · creativecodecampus',
  skipLink: 'Zum Setup springen',
  nav: {
    label: 'Seitenbereiche',
    setup: 'Setup',
    security: 'Sicherheit',
    verify: 'Prüfen',
  },
  lang: {
    group: 'Sprache',
  },
  hero: {
    eyebrow: 'Fortgeschrittenes KI-Setup für alle',
    secondaryCta: 'Alle Schritte ansehen',
    meta: ['Open Source', 'Windows, macOS und Linux'],
  },
  newTab: ' (öffnet in neuem Tab)',
  steps: (n) => `${n} ${n === 1 ? 'Schritt' : 'Schritte'}`,
  noAgent: 'Kein Agent',
  output: {
    aside: 'Live-Ausgabe',
    heading: 'Dein Prompt',
    promptLabel: 'Generierter Prompt',
    show: 'Prompt anzeigen',
    hide: 'Prompt ausblenden',
  },
  copy: {
    label: 'Kopieren',
    copied: 'Kopiert',
    failed: 'Fehlgeschlagen',
    copiedStatus: 'In die Zwischenablage kopiert',
    failedStatus: 'Kopieren fehlgeschlagen. Markiere den Text und kopiere ihn von Hand.',
  },
  docsFor: (docs, context) => `${docs} zu ${context} (öffnet in neuem Tab)`,
  choose: {
    agentsLegend: 'Coding-Agenten',
    recommended: 'empfohlen',
    keepOneAgent: 'Lass mindestens einen Agenten ausgewählt.',
    detectedOs: 'Aus deinem Browser erkannt.',
  },
  goalsLegend: 'Ziele',
  extras: {
    legend: 'Extras',
    note: 'Hinweis',
    telemetryDetails: 'Details zur Telemetrie',
  },
  security: {
    count: (total, auto, human) =>
      `Dein Setup hat ${total} ${total === 1 ? 'Schritt' : 'Schritte'}: ${auto} kann der Agent ausführen, ${human} erledigst du selbst.`,
    permissionDocs: 'Berechtigungen in der Dokumentation',
    permissionDocsFor: (agent) => ` für ${agent} (öffnet in neuem Tab)`,
  },
  setup: {
    pathOne: 'Weg eins: den Prompt kopieren',
    pathTwo: 'Weg zwei: jeden Schritt selbst',
    osTabs: 'Betriebssystem für die Schritte',
  },
  step: {
    commandFor: (title) => `Befehl für „${title}“`,
    commandNFor: (n, title) => `Befehl ${n} für „${title}“`,
    scriptFor: (title) => `Skript für „${title}“`,
    adminInline: 'Braucht Administratorrechte: Dein Computer fragt nach deinem Passwort.',
    openHost: (host) => `${host} öffnen`,
    seeHouseRules: 'Zu den Hausregeln',
    noCommand: (os) => `Für ${os} gibt es hier keinen Befehl.`,
    followDocs: 'Folge der offiziellen Dokumentation',
    docsForStep: (title) => ` zu „${title}“ (öffnet in neuem Tab)`,
    warning: 'Achtung',
  },
  houseRules: {
    docsForAgent: (agent) => ` zu den Instruktionsdateien von ${agent} (öffnet in neuem Tab)`,
  },
  verify: {
    osTabs: 'Betriebssystem für das Prüfskript',
    context: 'Prüfskript',
  },
  start: {
    exampleContext: 'grill-me-Beispiel',
  },
  consulting: {
    photoPlaceholder: 'Foto',
  },
  footer: {
    licence: 'Code unter MIT-Lizenz. Inhalte © creativecodecampus, alle Rechte vorbehalten.',
    source: 'Quellcode auf GitHub',
  },
};
