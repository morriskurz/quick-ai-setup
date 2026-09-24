// German per-project template. The global house rules (GLOBAL_RULES_BODY, the owner's own
// CLAUDE.md) and the RTK rule appended to them stay English in both languages.
// Infinitive instructions to the agent; "ich" is the reader. COPY: owner review.

import type { GoalId, Selection } from '../types';

export const PROJECT_HEADER_DE = `# Projektregeln

<!-- Ein oder zwei Sätze: worum es in diesem Projekt geht und für wen es ist. -->
`;

export const PROJECT_EMPTY_DE = `
## Arbeiten in diesem Projekt
- Nach jeder sinnvollen Änderung committen und sagen, was sich geändert hat und warum.
`;

export const PROJECT_FRAGMENTS_DE: Record<GoalId, (selection: Selection) => string> = {
  'docs-versioning': () => `
## Versionen
- Nach jeder sinnvollen Änderung committen und in einfacher Sprache sagen, was sich geändert hat und warum (zum Beispiel „Angebot: Zahlungsziel auf Wunsch des Kunden auf 30 Tage geändert“).
- Den Verlauf nie umschreiben oder löschen. Um etwas rückgängig zu machen, einen neuen Commit anlegen, der es umkehrt.
- Entwürfe und Endfassungen in derselben Datei halten; Git bewahrt den Verlauf.
`,
  websites: () => `
## Websites
- pnpm verwenden, nicht npm. Nie \`corepack enable\` ausführen.
- Das ist eine Vite-+-React-App, verwaltet von Vite+ (\`vp\`). \`vp dev\`, \`vp build\` und \`vp check\` verwenden, nicht die Tools darunter.
- Auf Cloudflare Workers mit Static Assets veröffentlichen, mit \`wrangler\`. Nicht Cloudflare Pages verwenden.
- Für Layout, Abstände und Bewegung dem Skill emil-design-eng folgen. Seiten in Handy- und Desktop-Breite prüfen.
- Secrets aus dem Repository heraushalten: in \`.env\` (in \`.gitignore\` eingetragen) oder im Secret Store von Cloudflare.
`,
  apps: () => `
## Apps
- Das ist eine Flutter-App. \`flutter analyze\` und \`flutter test\` ausführen, bevor eine Änderung als fertig gilt.
- Ein Feature auf mindestens einem echten Ziel testen (einem Handy oder dem Desktop-Build), bevor es als fertig gilt.
`,
  'data-pipelines': () => `
## Datenpipelines
- uv für Python verwenden, nie direkt pip: \`uv add\` für Bibliotheken, \`uv run\` für Skripte.
- Jedes Skript muss reproduzierbar sein: Jemand anderes führt einen Befehl aus und bekommt dasselbe Ergebnis.
- Eingabedaten im Projekt speichern (zum Beispiel in \`data/raw/\`), mit Quelle und Datum. Rohdaten nie überschreiben; Ergebnisse in einen eigenen Ordner schreiben.
`,
  'browser-automation': (selection) => `
## Browser-Automatisierung
- Für Browseraufgaben agent-browser verwenden (\`agent-browser --help\` listet die Befehle).${
    selection.agents.includes('claude-code')
      ? ' In Claude Code ist stattdessen Claude in Chrome erlaubt, wenn ich auf der Website angemeldet bin.'
      : ''
  }
- Nie Passwörter, Zahlungsdaten oder Einmalcodes eingeben. Anhalten und mich bitten, das selbst zu tun.
- Fragen, bevor ein Formular abgeschickt, eine Nachricht gesendet oder ein Kauf bestätigt wird.
`,
  'existing-programs': () => `
## Office-Dateien und Google Workspace
- Für Word, Excel, PowerPoint und PDF die Skills docx, xlsx, pptx und pdf verwenden und echte Dateien erzeugen, keine Textkopien.
- Die Originaldatei unverändert lassen; die eigene Fassung unter neuem Namen speichern.
- Für Gmail, Kalender, Drive, Docs und Sheets die \`gws\` CLI über die gws-Skills verwenden.
- Mir jede E-Mail und jede Kalendereinladung zeigen und vor dem Senden auf mein Ja warten. Nie Mails oder Dateien löschen.
`,
};
