// German text for steps, command notes, agents, goals and extras.
// Keyed by the English ids (and, for command notes, by the English note text), so commands,
// URLs, flags, versions and step order stay in the English data only.
// Formal "Sie"; the owner speaks as "ich". COPY: owner review — everything in this file.

import { GWS_SERVICES } from '../steps/goals';
import { RTK_TELEMETRY_DOCS } from '../steps/extras';
import type { AgentId, ExtraId, GoalId } from '../types';

export interface StepDe {
  title: string;
  why: string;
  /** Required when the English step has human.instructions. */
  instructions?: string;
  /** Required when the English step has a warning. */
  warning?: string;
}

export const stepsDe: Record<string, StepDe> = {
  // ── Baseline ──────────────────────────────────────────────────────────────
  'powershell-scripts': {
    title: 'PowerShell erlauben, installierte Tools auszuführen',
    why: 'Windows blockiert PowerShell-Skripte standardmäßig; über Node installierte Tools brauchen sie.',
    instructions:
      'Öffnen Sie PowerShell (nicht als Administrator), führen Sie den Befehl aus und bestätigen Sie die Rückfrage mit Ja (J oder Y).',
  },
  homebrew: {
    title: 'Homebrew installieren',
    why: 'Der Paketmanager für macOS, den mehrere Schritte unten nutzen.',
    instructions: [
      'Überspringen Sie das, wenn `brew --version` eine Version ausgibt.',
      '1. Führen Sie den Befehl selbst im Terminal aus und geben Sie Ihr Mac-Passwort ein.',
      '2. Führen Sie die Zeilen aus, die er unter „Next steps“ ausgibt. Sie legen brew in Ihren PATH.',
      '3. Öffnen Sie ein neues Terminal-Fenster.',
    ].join('\n'),
  },
  git: {
    title: 'Git installieren',
    why: 'Bewahrt jede Version jeder Datei auf, damit der Agent seine Fehler rückgängig machen kann.',
  },
  node: {
    title: 'Node.js LTS installieren',
    why: 'Die meisten Tools hier installieren sich über Node; LTS bekommt jahrelang Sicherheitsupdates.',
  },
  context7: {
    title: 'Context7 verbinden',
    why: 'Gibt dem Agenten aktuelle Dokumentation zu Bibliotheken statt veraltetem Wissen.',
    instructions:
      'Führen Sie den Befehl in Ihrem eigenen Terminal aus. Drücken Sie Enter, melden Sie sich im Browser bei context7.com an und bestätigen Sie den Code. Der Schlüssel wird für Sie gespeichert; Sie fügen nichts ein.',
    warning:
      'Braucht eine kostenlose Anmeldung bei context7.com; ctx7 sendet anonyme Nutzungsdaten, außer Sie setzen CTX7_TELEMETRY_DISABLED=1.',
  },
  'grill-me': {
    title: 'Den grill-me-Skill hinzufügen',
    why: 'Der Agent befragt Sie, bevor er baut; beginnen Sie eine Anfrage mit „grill me“.',
  },

  // ── Agents ────────────────────────────────────────────────────────────────
  'install-claude-code': {
    title: 'Claude Code installieren',
    why: 'Der Agent, den ich empfehle: ein Programm, das sich selbst aktualisiert, ohne Node.js.',
  },
  'login-claude-code': {
    title: 'Bei Claude Code anmelden',
    why: 'Braucht einen bezahlten Claude-Plan: Pro, Max, Team oder Enterprise.',
    instructions:
      'Führen Sie claude in einem Terminal aus. Melden Sie sich im Browser, der sich öffnet, mit Ihrem Claude-Konto an und tippen Sie dann /exit.',
  },
  'install-codex': {
    title: 'Codex installieren',
    why: 'Der Coding-Agent von OpenAI; er läuft mit Ihrem ChatGPT-Plan.',
  },
  'login-codex': {
    title: 'Bei Codex anmelden',
    why: 'Die Anmeldung mit ChatGPT erspart einen eigenen API-Schlüssel.',
    instructions: 'Führen Sie codex in einem Terminal aus. Wählen Sie „Sign in with ChatGPT“ und schließen Sie im Browser ab.',
  },
  'install-opencode': {
    title: 'OpenCode installieren',
    why: 'Ein Open-Source-Coding-Agent, der mit vielen Modellanbietern arbeitet.',
  },
  'login-opencode': {
    title: 'OpenCode mit einem Modellanbieter verbinden',
    why: 'OpenCode hat kein eigenes Modell; verbinden Sie einmal ein Anbieterkonto.',
    instructions:
      'Führen Sie opencode in einem Terminal aus. Tippen Sie /connect, wählen Sie einen Anbieter und melden Sie sich an. Zeigt er Ihnen einen Schlüssel, fügen Sie ihn selbst in OpenCode ein, nie in einen Chat.',
  },

  // ── Goals ─────────────────────────────────────────────────────────────────
  'git-identity': {
    title: 'Git sagen, wer Sie sind',
    why: 'Git speichert keine Versionen, bevor Name und E-Mail gesetzt sind.',
    instructions:
      'Führen Sie beide Befehle selbst aus, mit Ihrem eigenen Namen und Ihrer geschäftlichen E-Mail. Beides bleibt auf diesem Computer.',
  },
  'github-account': {
    title: 'Ein GitHub-Konto anlegen',
    why: 'Speichert Ihre Projekte und deren Verlauf außerhalb Ihres Computers.',
    instructions: 'Legen Sie unter github.com/signup ein Konto mit Ihrer geschäftlichen E-Mail an, falls Sie noch keins haben.',
  },
  gh: {
    title: 'Die GitHub CLI (gh) installieren',
    why: 'Damit legt der Agent Repositorys an, öffnet Änderungen zur Prüfung und liest fehlgeschlagene Checks.',
  },
  'gh-login': {
    title: 'Im Terminal bei GitHub anmelden',
    why: 'Eine Anmeldung, und gh und Git nutzen Ihr Konto ohne Passwörter.',
    instructions:
      'Führen Sie den Befehl selbst aus. Wählen Sie GitHub.com, HTTPS, dann „Login with a web browser“, und geben Sie den Einmalcode auf der Seite ein, die sich öffnet.',
  },
  'vite-plus': {
    title: 'Vite+ (vp) installieren',
    why: 'Eine Toolchain, die eine Website mit Vite und React anlegt, startet, testet und baut.',
    warning: 'Vite+ ist ein Release Candidate (1.0.0-rc.0); machen node oder npm danach Probleme, führen Sie `vp env off` aus.',
  },
  'cloudflare-account': {
    title: 'Ein Cloudflare-Konto anlegen',
    why: 'Hostet die Website auf Workers; kleine Websites passen in den kostenlosen Plan.',
    instructions: 'Legen Sie unter dash.cloudflare.com/sign-up ein Konto an, falls Sie noch keins haben.',
  },
  'wrangler-login': {
    title: 'Wrangler mit Ihrem Cloudflare-Konto verbinden',
    why: 'Das Deploy-Tool von Cloudflare; nach einer Anmeldung veröffentlicht der Agent ohne Schlüssel.',
    instructions:
      'Führen Sie npx wrangler login selbst aus und erlauben Sie den Zugriff im Browser. Führen Sie dann npx wrangler whoami aus.',
  },
  'cloudflare-skills': {
    title: 'Die Skills von Cloudflare hinzufügen',
    why: 'Aktuelle Anleitungen von Cloudflare, um Workers zu konfigurieren und zu veröffentlichen.',
  },
  'emil-skills': {
    title: 'Den Design-Skill von Emil Kowalski hinzufügen',
    why: 'Regeln für Abstände, Bewegung und Details, damit Seiten nicht beliebig aussehen.',
  },
  flutter: {
    title: 'Flutter installieren (mit Dart)',
    why: 'Eine Codebasis für iPhone, Android, Windows, macOS und das Web; Dart ist dabei.',
    warning:
      'Führen Sie die Befehle der Reihe nach aus und öffnen Sie dann ein neues Terminal; Builds für iPhone und Android brauchen zusätzlich Xcode oder Android Studio.',
  },
  uv: {
    title: 'uv installieren',
    why: 'Installiert Python und die Bibliotheken jedes Skripts, damit Skripte auf jedem Computer gleich laufen.',
  },
  python: {
    title: 'Python mit uv installieren',
    why: 'uv installiert ein eigenes Python, ohne ein vorhandenes anzufassen.',
  },
  'claude-in-chrome': {
    title: 'Claude in Chrome verbinden',
    why: 'Claude Code nutzt Ihr angemeldetes Chrome und hält bei Logins und CAPTCHAs an.',
    instructions: [
      'Braucht einen Pro-, Max-, Team- oder Enterprise-Plan, angemeldet mit /login. Funktioniert in Chrome und Edge, nicht in WSL.',
      '1. Installieren Sie die Claude-Erweiterung aus dem Chrome Web Store.',
      '2. Starten Sie Claude Code mit claude --chrome, tippen Sie /chrome und wählen Sie „Enabled by default“.',
      '3. Wird die Erweiterung nicht erkannt, starten Sie Chrome neu.',
    ].join('\n'),
  },
  'agent-browser': {
    title: 'agent-browser installieren',
    why: 'Ein Browser für die Kommandozeile, für jeden Agenten; keine Erweiterung nötig.',
    warning: 'Ohne Chrome lädt `agent-browser install` einen zweiten Browser herunter (Chrome for Testing), mehrere hundert MB.',
  },
  'agent-browser-skill': {
    title: 'Den agent-browser-Skill hinzufügen',
    why: 'Bringt dem Agenten agent-browser bei, mit Anleitungen aus der installierten Version.',
  },
  'office-skills-claude-code': {
    title: 'Skills für Word und PowerPoint hinzufügen (Claude Code)',
    why: 'Echte Word- und PowerPoint-Dateien; die Skills für PDF und Excel kommen über Ihr Claude-Konto.',
  },
  'office-skills': {
    title: 'Skills für Word, Excel, PowerPoint und PDF hinzufügen',
    why: 'Echte Word-, Excel-, PowerPoint- und PDF-Dateien; source-available von Anthropic, nicht Open Source.',
  },
  gws: {
    title: 'Die Google Workspace CLI (gws) installieren',
    why: 'Die CLI hinter den Google-Workspace-Skills; laut README ist sie kein offiziell unterstütztes Google-Produkt.',
  },
  'gws-skills': {
    title: 'Die Google-Workspace-Skills hinzufügen',
    why: 'Gmail, Kalender, Drive, Docs und Sheets; gws-shared verlangt vor jedem Schreiben oder Löschen eine Bestätigung.',
  },
  gcloud: {
    title: 'Die Google Cloud CLI (gcloud) installieren',
    why: 'Damit legt `gws auth setup` das Google-Cloud-Projekt an, das Google verlangt.',
  },
  'gws-auth': {
    title: 'gws mit Ihrem Google-Konto verbinden',
    why: 'Gibt dem Agenten Ihre Mails, Termine und Dateien, begrenzt auf das, was Sie sehen können.',
    instructions: [
      'Machen Sie das einmal, zusammen mit der Person, die Ihre IT betreut. Planen Sie 20 bis 30 Minuten ein.',
      '1. Führen Sie gws auth setup selbst aus und folgen Sie der Ausgabe. Fragt es nach einer Client-Datei aus der Cloud Console, laden Sie diese herunter.',
      `2. Führen Sie gws auth login -s ${GWS_SERVICES} aus. Fordern Sie nur diese Dienste an; alle auf einmal schlagen fehl.`,
      '3. Beim Hinweis, dass Google diese App nicht überprüft hat, klicken Sie auf „Weiter“ („Continue“) und erlauben dann den Zugriff. Bei Ihrer eigenen App ist das normal.',
      'Wenn sich gcloud nicht installieren lässt: Legen Sie in der Cloud Console ein Projekt an, stellen Sie den Zustimmungsbildschirm auf „Extern“, tragen Sie sich unter Testnutzer ein, erstellen Sie einen OAuth-Client vom Typ Desktop-App, speichern Sie dessen Datei als ~/.config/gws/client_secret.json und führen Sie dann Schritt 2 aus.',
    ].join('\n'),
    warning:
      'Der schwierigste Schritt hier: Nutzt Ihr Unternehmen Google Workspace, muss die Administration die App eventuell erst zulassen.',
  },
  'docs-walkthrough': {
    title: 'Einen Ordner mit Dokumenten versionieren',
    why: 'Jede Version hält fest, was sich warum geändert hat; Sie können zu jeder zurück.',
    instructions:
      'Öffnen Sie ein Terminal in einem Ordner mit Dokumenten (etwa Ihren Angeboten) und führen Sie die drei Befehle aus. Ab dann bitten Sie Ihren Agenten, nach jeder Änderung eine Version zu speichern.',
  },

  // ── Extras and closing steps ──────────────────────────────────────────────
  rtk: {
    title: 'RTK installieren',
    why: 'Kürzt die Befehlsausgabe, bevor der Agent sie liest, und spart so Nutzung.',
    warning: `Telemetrie ist aus, solange Sie nicht zustimmen, wenn \`rtk init\` fragt: prüfen mit \`rtk telemetry status\`, abschalten mit \`rtk telemetry disable\`, sperren mit RTK_TELEMETRY_DISABLED=1 (${RTK_TELEMETRY_DOCS}).`,
  },
  'rtk-init-claude-code': {
    title: 'RTK mit Claude Code verbinden',
    why: 'Installiert den Claude-Code-Hook von RTK; starten Sie Claude Code danach neu.',
  },
  'rtk-init-codex': {
    title: 'RTK mit Codex verbinden',
    why: 'Installiert den Codex-Hook von RTK; starten Sie Codex danach neu.',
  },
  'rtk-init-opencode': {
    title: 'RTK mit OpenCode verbinden',
    why: 'Installiert nur das OpenCode-Plugin von RTK, keinen Claude-Code-Hook; starten Sie OpenCode danach neu.',
  },
  caveman: {
    title: 'Den Caveman-Skill hinzufügen',
    why: 'Kürzt den Text rund um Code, Befehle und Fehler; „stop caveman“ schaltet ihn ab.',
  },
  'backup-instructions': {
    title: 'Die Instruktionsdateien Ihrer Agenten sichern',
    why: 'Context7 und RTK bearbeiten diese Dateien, deshalb kommt zuerst eine datierte Kopie.',
  },
  'house-rules': {
    title: 'Die Hausregeln schreiben',
    why: 'Regeln, die der Agent in jeder Sitzung liest: Arbeit prüfen, Geschriebenes ausführen, Annahmen nennen.',
    instructions:
      'Fügen Sie die Hausregeln unten am Ende der Instruktionsdatei jedes Agenten an. Behalten Sie, was schon darin steht.',
  },
  verify: {
    title: 'Das Setup prüfen',
    why: 'Gibt die Version jedes Tools aus oder „not installed“; ändert nichts.',
  },
};

/**
 * Command notes, keyed by the English note text. Notes that start with the English
 * administrator prefix must start with ADMIN_NOTE_PREFIX_DE ("Braucht Administratorrechte").
 */
export const notesDe: Record<string, string> = {
  'Your user account only. Scripts downloaded from the internet still need a signature.':
    'Nur für Ihr Benutzerkonto. Aus dem Internet geladene Skripte brauchen weiterhin eine Signatur.',
  'Needs administrator rights: asks for your Mac password.': 'Braucht Administratorrechte: fragt nach Ihrem Mac-Passwort.',
  'Needs administrator rights: Windows may ask you to allow the installer to make changes.':
    'Braucht Administratorrechte: Windows fragt eventuell, ob der Installer Änderungen vornehmen darf.',
  'Needs administrator rights: asks for your password (Debian and Ubuntu).':
    'Braucht Administratorrechte: fragt nach Ihrem Passwort (Debian und Ubuntu).',
  'Loads nvm in this window.': 'Lädt nvm in diesem Fenster.',
  'Needs Node.js from the earlier step.': 'Braucht Node.js aus dem Schritt davor.',
  'Needs administrator rights: adds GitHub’s package source and asks for your password (Debian and Ubuntu).':
    'Braucht Administratorrechte: fügt die Paketquelle von GitHub hinzu und fragt nach Ihrem Passwort (Debian und Ubuntu).',
  'Untested on Windows: the three settings are documented for the macOS/Linux installer.':
    'Unter Windows ungetestet: Die drei Einstellungen sind für den Installer unter macOS und Linux dokumentiert.',
  'Checks the sign-in.': 'Prüft die Anmeldung.',
  'Downloads about 1.9 GB.': 'Lädt etwa 1,9 GB herunter.',
  'Adds Flutter to your user PATH; open a new terminal afterwards.':
    'Fügt Flutter Ihrem Benutzer-PATH hinzu; öffnen Sie danach ein neues Terminal.',
  'Downloads about 1.6 GB.': 'Lädt etwa 1,6 GB herunter.',
  'For bash; with zsh, add the line to ~/.zshenv. Then open a new terminal.':
    'Für bash; mit zsh gehört die Zeile in ~/.zshenv. Öffnen Sie dann ein neues Terminal.',
  'Needs administrator rights: also installs system libraries and asks for your password.':
    'Braucht Administratorrechte: installiert auch Systembibliotheken und fragt nach Ihrem Passwort.',
  'Needs administrator rights: opens Google’s installer window; click through it yourself.':
    'Braucht Administratorrechte: öffnet das Installationsfenster von Google; klicken Sie sich selbst durch.',
  'Homebrew cask (formulae.brew.sh/cask/gcloud-cli); Google’s page documents a download-and-extract install.':
    'Homebrew-Cask (formulae.brew.sh/cask/gcloud-cli); die Seite von Google beschreibt eine Installation per Download und Entpacken.',
  'Needs administrator rights: asks for your password.': 'Braucht Administratorrechte: fragt nach Ihrem Passwort.',
  'Never overwrites an earlier copy.': 'Überschreibt nie eine frühere Kopie.',
  'May ask to share usage statistics. Only you answer; an agent stops and asks you.':
    'Fragt eventuell, ob Nutzungsstatistiken geteilt werden dürfen. Das beantworten nur Sie; ein Agent hält an und fragt Sie.',
};

/** Agent labels are product names and stay English; only the summary is translated. */
export const agentsDe: Record<AgentId, { summary: string }> = {
  'claude-code': { summary: 'Der Agent von Anthropic. Braucht einen bezahlten Claude-Plan. Nötig für Claude in Chrome.' },
  codex: { summary: 'Der Agent von OpenAI, für Firmen, die schon ChatGPT Plus, Business oder Enterprise nutzen.' },
  opencode: { summary: 'Open Source, viele Modellanbieter.' },
};

export const goalsDe: Record<GoalId, { label: string; summary: string }> = {
  'docs-versioning': {
    label: 'Versionen meiner Dokumente behalten',
    summary: 'Jede Änderung an Verträgen, Angeboten und Tabellen nachverfolgen; jede Version wiederherstellen.',
  },
  websites: {
    label: 'Websites bauen',
    summary: 'Eine Website bauen, bei Cloudflare hosten, den Code auf GitHub ablegen.',
  },
  apps: {
    label: 'Apps bauen',
    summary: 'Eine Flutter-App für iPhone, Android, Windows und Mac.',
  },
  'data-pipelines': {
    label: 'Datenpipelines bauen',
    summary: 'Aus Exporten und Tabellen immer denselben Bericht machen, mit einem Befehl.',
  },
  'browser-automation': {
    label: 'Den Browser automatisieren',
    summary: 'Der Agent klickt sich durch Portale, füllt Formulare aus und sammelt Daten.',
  },
  'existing-programs': {
    label: 'In meinen bestehenden Programmen arbeiten',
    summary: 'Word, Excel, PowerPoint und PDF, dazu Gmail, Kalender, Drive, Docs und Sheets.',
  },
};

export const extrasDe: Record<ExtraId, { label: string; summary: string; warning: string }> = {
  rtk: {
    label: 'RTK: kürzere Tool-Ausgabe',
    summary: 'Komprimiert die Befehlsausgabe, damit mehr Arbeit in eine Sitzung passt.',
    warning: 'Sie sehen weniger von dem, was der Agent sah; Telemetrie ist optional und aus, solange Sie nicht zustimmen.',
  },
  caveman: {
    label: 'Caveman: kürzere Antworten',
    summary: 'Knappe Antworten: schneller zu lesen, sobald Sie sich daran gewöhnt haben.',
    warning: 'Sie sehen weniger von den Überlegungen des Agenten.',
  },
};
