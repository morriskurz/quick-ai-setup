// German prose for the generated agent prompt. Same rules, same order and the same meaning
// as PROMPT_EN in src/lib/generate.ts. The literal word STOP stays: agents and tests key on it.
// The reader addresses the agent formally ("Sie"). COPY: owner review.

import type { PromptText } from '../../lib/generate';

export const PROMPT_DE: PromptText = {
  osLabel: {
    windows: 'Windows (PowerShell)',
    macos: 'macOS (Terminal, zsh)',
    linux: 'Linux, Debian oder Ubuntu (bash)',
  },
  intro:
    'Sie richten diesen Computer für die Arbeit mit KI ein. Ich programmiere nicht: Antworten Sie mir auf Deutsch und erklären Sie alles in einfacher Sprache.',
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
    'Führen Sie die Schritte unten der Reihe nach aus, nur mit den angegebenen Befehlen. Ist das Tool eines Schritts schon installiert (vorher mit --version prüfen), überspringen Sie ihn und sagen es mir. Sie sind einer der oben genannten Agenten: Überspringen Sie Ihre eigene Installation und Anmeldung.',
    'Zeigen Sie jeden Befehl, bevor Sie ihn ausführen, und sagen Sie in einem Satz, was er tut. Dann führen Sie ihn aus.',
    'Schlägt ein Befehl fehl, erklären Sie den Fehler in einfachen Worten und schlagen Sie eine Lösung vor. Wechseln Sie nie eigenmächtig zu einem anderen Installer.',
    'Tippen, erfragen oder speichern Sie nie Passwörter, Tokens, Schlüssel oder Einmalcodes, und fügen Sie sie nie in diesen Chat ein. Sagen Sie mir, dass ich das auch nicht tun soll.',
    'Wenn ein Schritt STOP sagt, halten Sie an. Sagen Sie mir genau, was ich tun soll, und warten Sie, bis ich „fertig“ antworte.',
    'Führen Sie sudo- oder Administratorbefehle nie selbst aus. Zeigen Sie sie mir, STOP, und bitten Sie mich, sie in meinem eigenen Terminal auszuführen.',
    'Wartet ein Befehl auf eine Eingabe, die Sie nicht geben können, brechen Sie ihn ab und fragen Sie mich.',
    'Löschen Sie keine Dateien und ändern Sie keine Einstellungen über das hinaus, was ein Schritt sagt.',
  ],
  windowsPathRule: (refresh) =>
    `Aktualisieren Sie nach jeder Installation PATH in Ihrer Shell, bevor der nächste Schritt kommt: ${refresh}`,
  posixPathRule:
    'Wird ein neu installierter Befehl nicht gefunden, laden Sie das Shell-Profil neu oder bitten Sie mich, ein neues Terminal zu öffnen.',
  stepsHeading: 'Schritte',
  verifyInstruction:
    'Fügen Sie diese Prüfung in eine frische Shell ein (nicht als Datei speichern) und zeigen Sie mir die vollständige Ausgabe:',
  humanStop: '— STOP: Das mache ich selbst.',
  link: 'Link',
  showCommands: 'Zeigen Sie mir diese Befehle, damit ich sie in meinem eigenen Terminal ausführe:',
  tellFirst: 'Sagen Sie mir vorher:',
  waitDone: 'Warten Sie, bis ich „fertig“ sage.',
  beforeStep: 'Sagen Sie mir vor diesem Schritt:',
  adminStop:
    'STOP: Das braucht Administratorrechte. Zeigen Sie mir den Befehl, bitten Sie mich, ihn auszuführen, und warten Sie, bis ich „fertig“ sage:',
  finishHeading: 'Abschluss',
  summary:
    '- Fassen Sie kurz zusammen: was installiert wurde (mit Versionen), was übersprungen wurde oder fehlschlug und welche Schritte ich noch selbst erledigen muss.',
  bothFiles: 'AGENTS.md und CLAUDE.md',
  showTemplate: (files) =>
    `- Zeigen Sie mir dann diese Vorlage und sagen Sie mir, dass ich sie in jedes neue Projekt als ${files} kopieren soll:`,
  startClaude:
    'Claude Code in einem Projektordner neu starten und /grill-me tippen, gefolgt von dem, was ich erreichen will',
  startOthers: (names) =>
    `in ${names} in einem Projektordner starten und „Den grill-me-Skill verwenden:“ tippen, gefolgt von dem, was ich will`,
  or: ' oder ',
  startLine: (parts) => `- Sagen Sie mir zum Schluss, wie ich anfange: ${parts}.`,
  houseRulesHeading: (n) => `${n}. Schreiben Sie die Hausregeln in die globale Instruktionsdatei jedes Agenten:`,
  forEachFile: 'Für jede Datei:',
  backupDone: '- Der erste Schritt hat das Backup angelegt. Legen Sie kein weiteres an: Installer haben die Datei seitdem geändert.',
  merge:
    '- Zusammenführen: Behalten Sie alles in der Datei und fügen Sie die Regeln unten am Ende an; lassen Sie jede Regel weg, die dort schon mit anderen Worten steht.',
  create: '- Existiert sie nicht, legen Sie sie (und ihren Ordner) mit den Regeln unten an.',
  agentsMdHeading: (a, c) => `- In AGENTS.md-Dateien lautet die erste Zeile „${a}“ statt „${c}“.`,
  keepRulesVerbatim: '- Die Regeln sind auf Englisch. Übernehmen Sie sie wörtlich, ohne sie zu übersetzen.',
  showFinal: '- Zeigen Sie mir die fertige Datei, bevor Sie sie speichern.',
};
