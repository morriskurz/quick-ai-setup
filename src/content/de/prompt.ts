// German prose for the generated agent prompt. Same rules, same order and the same meaning
// as PROMPT_EN in src/lib/generate.ts. The literal word STOP stays: agents and tests key on it.
// The reader addresses the agent with "du" (owner decision 2026-09-24). COPY: owner review.

import type { PromptText } from '../../lib/generate';

export const PROMPT_DE: PromptText = {
  osLabel: {
    windows: 'Windows (PowerShell)',
    macos: 'macOS (Terminal, zsh)',
    linux: 'Linux, Debian oder Ubuntu (bash)',
  },
  intro:
    'Du richtest diesen Computer für die Arbeit mit KI ein. Ich programmiere nicht: Antworte mir auf Deutsch und erkläre alles in einfacher Sprache.',
  aboutMe: 'Über mich',
  system: 'System',
  agentsUsed: 'Meine Coding-Agenten',
  noAgents: 'keiner ausgewählt',
  goals: 'Ziele',
  noGoals: 'nur die Grundausstattung',
  extras: 'Extras',
  noExtras: 'keine',
  rulesHeading: 'Regeln für die ganze Aufgabe',
  rules: [
    'Führe die Schritte unten der Reihe nach aus, nur mit den angegebenen Befehlen. Ist das Tool eines Schritts schon installiert (vorher mit --version prüfen), überspring ihn und sag es mir. Du bist einer der oben genannten Agenten: Überspring deine eigene Installation und Anmeldung.',
    'Zeig jeden Befehl, bevor du ihn ausführst, und sag in einem Satz, was er tut. Dann führ ihn aus.',
    'Schlägt ein Befehl fehl, erkläre den Fehler in einfachen Worten und schlag eine Lösung vor. Wechsle nie eigenmächtig zu einem anderen Installer.',
    'Tippe, erfrage oder speichere nie Passwörter, Tokens, Schlüssel oder Einmalcodes, und füge sie nie in diesen Chat ein. Sag mir, dass ich das auch nicht tun soll.',
    'Wenn ein Schritt STOP sagt, halte an. Sag mir genau, was ich tun soll, und warte, bis ich „fertig“ antworte.',
    'Führe sudo- oder Administratorbefehle nie selbst aus. Zeig sie mir, STOP, und bitte mich, sie in meinem eigenen Terminal auszuführen.',
    'Wartet ein Befehl auf eine Eingabe, die du nicht geben kannst, brich ihn ab und frag mich.',
    'Lösche keine Dateien und ändere keine Einstellungen über das hinaus, was ein Schritt sagt.',
  ],
  windowsPathRule: (refresh) =>
    `Aktualisiere nach jeder Installation PATH in deiner Shell, bevor der nächste Schritt kommt: ${refresh}`,
  posixPathRule:
    'Wird ein neu installierter Befehl nicht gefunden, lade das Shell-Profil neu oder bitte mich, ein neues Terminal zu öffnen.',
  stepsHeading: 'Schritte',
  verifyInstruction:
    'Füge diese Prüfung in eine frische Shell ein (nicht als Datei speichern) und zeig mir die vollständige Ausgabe:',
  humanStop: '— STOP: Das mache ich selbst.',
  link: 'Link',
  showCommands: 'Zeig mir diese Befehle, damit ich sie in meinem eigenen Terminal ausführe:',
  tellFirst: 'Sag mir vorher:',
  waitDone: 'Warte, bis ich „fertig“ sage.',
  beforeStep: 'Sag mir vor diesem Schritt:',
  adminStop:
    'STOP: Das braucht Administratorrechte. Zeig mir den Befehl, bitte mich, ihn auszuführen, und warte, bis ich „fertig“ sage:',
  finishHeading: 'Abschluss',
  summary:
    '- Fass kurz zusammen: was installiert wurde (mit Versionen), was übersprungen wurde oder fehlschlug und welche Schritte ich noch selbst erledigen muss.',
  bothFiles: 'AGENTS.md und CLAUDE.md',
  showTemplate: (files) =>
    `- Zeig mir dann diese Vorlage und sag mir, dass ich sie in jedes neue Projekt als ${files} kopieren soll:`,
  startClaude:
    'Claude Code in einem Projektordner neu starten und /grill-me tippen, gefolgt von dem, was ich erreichen will',
  startOthers: (names) =>
    `in ${names} in einem Projektordner starten und „Nutze den grill-me-Skill:“ tippen, gefolgt von dem, was ich will`,
  or: ' oder ',
  startLine: (parts) => `- Sag mir zum Schluss, wie ich anfange: ${parts}.`,
  houseRulesHeading: (n) => `${n}. Schreib die Hausregeln in die globale Instruktionsdatei jedes Agenten:`,
  forEachFile: 'Für jede Datei:',
  backupDone: '- Der erste Schritt hat das Backup angelegt. Leg kein weiteres an: Installer haben die Datei seitdem geändert.',
  merge:
    '- Zusammenführen: Behalte alles in der Datei und füge die Regeln unten am Ende an; lass jede Regel weg, die dort schon mit anderen Worten steht.',
  create: '- Existiert sie nicht, leg sie (und ihren Ordner) mit den Regeln unten an.',
  agentsMdHeading: (a, c) => `- In AGENTS.md-Dateien lautet die erste Zeile „${a}“ statt „${c}“.`,
  keepRulesVerbatim: '- Die Regeln sind auf Englisch. Übernimm sie wörtlich, ohne sie zu übersetzen.',
  showFinal: '- Zeig mir die fertige Datei, bevor du sie speicherst.',
};
