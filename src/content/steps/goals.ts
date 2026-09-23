// Goal steps. Order inside each goal's stepIds is the install order.
// COPY: owner review — titles, `why`, instructions and warnings.

import { adminNote, skillsAdd } from '../helpers';
import type { Command, Goal, OsId, Step } from '../types';

/**
 * Flutter stable release pinned at build time (releases_*.json on
 * storage.googleapis.com/flutter_infra_release, 3.47.5 released 2026-09-18).
 * docs.flutter.dev still showed 3.47.3 on 2026-09-23. Bump both URLs together.
 */
export const FLUTTER_VERSION = '3.47.5';

const all = (cmds: Command[]): Partial<Record<OsId, Command[]>> => ({ windows: cmds, macos: cmds, linux: cmds });

const GWS_SERVICES = 'gmail,calendar,drive,docs,sheets';

export const goalSteps: Step[] = [
  // ── Shared by the "build" goals and document versioning ───────────────────
  {
    id: 'git-identity',
    title: 'Tell Git who you are',
    why: 'Git will not save versions until your name and email are set.',
    kind: 'human',
    commands: all([
      { run: 'git config --global user.name "Your Name"' },
      { run: 'git config --global user.email you@example.com' },
    ]),
    human: {
      instructions: 'Run both commands yourself, with your own name and work email. They stay on this computer.',
    },
    docsUrl: 'https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup',
  },
  {
    id: 'github-account',
    title: 'Create a GitHub account',
    why: 'Stores your projects and their history off your computer.',
    kind: 'human',
    human: {
      instructions: 'Create an account at github.com/signup with your work email, unless you have one.',
      url: 'https://github.com/signup',
    },
    docsUrl: 'https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github',
  },
  {
    id: 'gh',
    title: 'Install the GitHub CLI (gh)',
    why: 'Lets the agent create repositories, open changes for review and read failed checks.',
    kind: 'command',
    commands: {
      windows: [
        {
          run: 'winget install --id GitHub.cli --source winget',
          note: adminNote('Windows may ask you to allow the installer to make changes.'),
        },
      ],
      macos: [{ run: 'brew install gh' }],
      linux: [
        {
          run: [
            '(type -p wget >/dev/null || (sudo apt update && sudo apt install wget -y)) \\',
            '\t&& sudo mkdir -p -m 755 /etc/apt/keyrings \\',
            '\t&& out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \\',
            '\t&& cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \\',
            '\t&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \\',
            '\t&& sudo mkdir -p -m 755 /etc/apt/sources.list.d \\',
            '\t&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \\',
            '\t&& sudo apt update \\',
            '\t&& sudo apt install gh -y',
          ].join('\n'),
          note: adminNote('adds GitHub’s package source and asks for your password (Debian and Ubuntu).'),
        },
      ],
    },
    docsUrl: 'https://github.com/cli/cli#installation',
  },
  {
    id: 'gh-login',
    title: 'Sign in to GitHub from the terminal',
    why: 'One sign-in lets gh and Git use your account without passwords.',
    kind: 'human',
    commands: all([{ run: 'gh auth login' }]),
    human: {
      instructions:
        'Run the command yourself. Choose GitHub.com, HTTPS, then “Login with a web browser”, and enter the one-time code on the page that opens.',
      url: 'https://github.com/login/device',
    },
    docsUrl: 'https://cli.github.com/manual/gh_auth_login',
  },

  // ── Websites ──────────────────────────────────────────────────────────────
  {
    id: 'vite-plus',
    title: 'Install Vite+ (vp)',
    why: 'One toolchain that creates, runs, tests and builds a Vite + React site.',
    kind: 'command',
    commands: {
      windows: [
        {
          run: "$env:VP_NODE_MANAGER='no'; $env:VP_PM_MANAGER='no'; $env:VP_PNPM_MANAGER='yes'; irm https://vite.plus/ps1 | iex",
          note: 'Untested on Windows: the three settings are documented for the macOS/Linux installer.',
        },
      ],
      macos: [{ run: 'curl -fsSL https://vite.plus | VP_NODE_MANAGER=no VP_PM_MANAGER=no VP_PNPM_MANAGER=yes bash' }],
      linux: [{ run: 'curl -fsSL https://vite.plus | VP_NODE_MANAGER=no VP_PM_MANAGER=no VP_PNPM_MANAGER=yes bash' }],
    },
    docsUrl: 'https://viteplus.dev/guide/global-cli',
    warning: 'Vite+ is a release candidate (1.0.0-rc.0); if node or npm misbehave afterwards, run `vp env off`.',
  },
  {
    id: 'cloudflare-account',
    title: 'Create a Cloudflare account',
    why: 'Hosts the site on Workers; small sites fit the free plan.',
    kind: 'human',
    human: {
      instructions: 'Create an account at dash.cloudflare.com/sign-up, unless you have one.',
      url: 'https://dash.cloudflare.com/sign-up',
    },
    docsUrl: 'https://developers.cloudflare.com/workers/get-started/guide/',
  },
  {
    id: 'wrangler-login',
    title: 'Connect Wrangler to your Cloudflare account',
    why: 'Cloudflare’s deploy tool; one sign-in lets the agent publish without keys.',
    kind: 'human',
    commands: all([{ run: 'npx wrangler login' }, { run: 'npx wrangler whoami', note: 'Checks the sign-in.' }]),
    human: {
      instructions: 'Run npx wrangler login yourself and allow access in the browser. Then run npx wrangler whoami.',
    },
    docsUrl: 'https://developers.cloudflare.com/workers/wrangler/commands/general/#login',
  },
  {
    id: 'cloudflare-skills',
    title: 'Add Cloudflare’s skills',
    why: 'Current Cloudflare instructions for configuring and deploying Workers.',
    kind: 'command',
    commands: all([{ run: skillsAdd('cloudflare/skills', ['cloudflare', 'wrangler', 'workers-best-practices']) }]),
    docsUrl: 'https://github.com/cloudflare/skills#installing',
  },
  {
    id: 'emil-skills',
    title: 'Add Emil Kowalski’s design skill',
    why: 'Rules for spacing, motion and detail, so pages do not look generic.',
    kind: 'command',
    commands: all([{ run: skillsAdd('emilkowalski/skills', ['emil-design-eng']) }]),
    docsUrl: 'https://github.com/emilkowalski/skills#install',
  },

  // ── Apps ──────────────────────────────────────────────────────────────────
  {
    id: 'flutter',
    title: 'Install Flutter (includes Dart)',
    why: 'One codebase for iPhone, Android, Windows, macOS and the web; Dart included.',
    kind: 'command',
    commands: {
      windows: [
        {
          run: `Invoke-WebRequest -Uri https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_${FLUTTER_VERSION}-stable.zip -OutFile "$env:USERPROFILE\\Downloads\\flutter_windows_${FLUTTER_VERSION}-stable.zip"`,
          note: 'Downloads about 1.9 GB.',
        },
        { run: 'New-Item -ItemType Directory -Force "$env:USERPROFILE\\develop" | Out-Null' },
        {
          run: `Expand-Archive -Path "$env:USERPROFILE\\Downloads\\flutter_windows_${FLUTTER_VERSION}-stable.zip" -DestinationPath "$env:USERPROFILE\\develop"`,
        },
        {
          run: "[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path','User') + \";$env:USERPROFILE\\develop\\flutter\\bin\", 'User')",
          note: 'Adds Flutter to your user PATH; open a new terminal afterwards.',
        },
      ],
      macos: [{ run: 'brew install --cask flutter' }],
      linux: [
        {
          run: 'sudo apt-get install -y curl git unzip xz-utils zip libglu1-mesa',
          note: adminNote('asks for your password (Debian and Ubuntu).'),
        },
        {
          note: 'Downloads about 1.6 GB.',
          run: `curl -fL -o ~/Downloads/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz`,
        },
        { run: `mkdir -p ~/develop && tar -xf ~/Downloads/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz -C ~/develop/` },
        {
          run: "echo 'export PATH=\"$HOME/develop/flutter/bin:$PATH\"' >> ~/.bashrc",
          note: 'For bash; with zsh, add the line to ~/.zshenv. Then open a new terminal.',
        },
      ],
    },
    docsUrl: 'https://docs.flutter.dev/install/manual',
    warning: 'Run the commands in order, then open a new terminal; iPhone and Android builds also need Xcode or Android Studio.',
  },

  // ── Data pipelines ────────────────────────────────────────────────────────
  {
    id: 'uv',
    title: 'Install uv',
    why: 'Installs Python and each script’s libraries, so scripts run the same on any computer.',
    kind: 'command',
    commands: {
      windows: [{ run: 'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"' }],
      macos: [{ run: 'curl -LsSf https://astral.sh/uv/install.sh | sh' }],
      linux: [{ run: 'curl -LsSf https://astral.sh/uv/install.sh | sh' }],
    },
    docsUrl: 'https://docs.astral.sh/uv/getting-started/installation/',
  },
  {
    id: 'python',
    title: 'Install Python with uv',
    why: 'uv installs its own Python without touching any existing one.',
    kind: 'command',
    commands: all([{ run: 'uv python install' }]),
    docsUrl: 'https://docs.astral.sh/uv/guides/install-python/',
  },

  // ── Browser automation ────────────────────────────────────────────────────
  {
    id: 'claude-in-chrome',
    title: 'Connect Claude in Chrome',
    why: 'Claude Code uses your signed-in Chrome and stops at logins and CAPTCHAs.',
    kind: 'human',
    agents: ['claude-code'],
    human: {
      instructions: [
        'Needs a Pro, Max, Team or Enterprise plan, signed in with /login. Works in Chrome and Edge, not inside WSL.',
        '1. Install the Claude extension from the Chrome Web Store.',
        '2. Start Claude Code with claude --chrome, type /chrome and choose “Enabled by default”.',
        '3. If the extension is not detected, restart Chrome.',
      ].join('\n'),
      url: 'https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn',
    },
    docsUrl: 'https://code.claude.com/docs/en/chrome',
  },
  {
    id: 'agent-browser',
    title: 'Install agent-browser',
    why: 'A command-line browser for every agent; no extension needed.',
    kind: 'command',
    commands: {
      windows: [{ run: 'npm install -g agent-browser' }, { run: 'agent-browser install' }],
      macos: [{ run: 'npm install -g agent-browser' }, { run: 'agent-browser install' }],
      linux: [
        { run: 'npm install -g agent-browser' },
        {
          run: 'agent-browser install --with-deps',
          note: adminNote('also installs system libraries and asks for your password.'),
        },
      ],
    },
    docsUrl: 'https://github.com/vercel-labs/agent-browser#installation',
    warning: 'Without Chrome, `agent-browser install` downloads a second browser (Chrome for Testing), several hundred MB.',
  },
  {
    id: 'agent-browser-skill',
    title: 'Add the agent-browser skill',
    why: 'Teaches the agent agent-browser, with instructions from the installed version.',
    kind: 'command',
    commands: all([{ run: skillsAdd('vercel-labs/agent-browser', []) }]),
    docsUrl: 'https://github.com/vercel-labs/agent-browser#ai-coding-assistants-recommended',
  },

  // ── Existing programs ─────────────────────────────────────────────────────
  {
    id: 'office-skills-claude-code',
    title: 'Add Word and PowerPoint skills (Claude Code)',
    why: 'Real Word and PowerPoint files; PDF and Excel skills sync from your Claude account.',
    kind: 'command',
    agents: ['claude-code'],
    commands: all([{ run: skillsAdd('anthropics/skills', ['docx', 'pptx'], ['claude-code']) }]),
    docsUrl: 'https://code.claude.com/docs/en/skills',
  },
  {
    id: 'office-skills',
    title: 'Add Word, Excel, PowerPoint and PDF skills',
    why: 'Real Word, Excel, PowerPoint and PDF files; source-available from Anthropic, not open source.',
    kind: 'command',
    agents: ['codex', 'opencode'],
    commands: all([{ run: skillsAdd('anthropics/skills', ['docx', 'xlsx', 'pptx', 'pdf'], ['codex', 'opencode']) }]),
    docsUrl: 'https://github.com/anthropics/skills',
  },
  {
    id: 'gws',
    title: 'Install the Google Workspace CLI (gws)',
    why: 'The CLI behind the Google Workspace skills; its README states it is not an officially supported Google product.',
    kind: 'command',
    commands: all([{ run: 'npm install -g @googleworkspace/cli' }]),
    docsUrl: 'https://github.com/googleworkspace/cli#installation',
  },
  {
    id: 'gws-skills',
    title: 'Add the Google Workspace skills',
    why: 'Gmail, Calendar, Drive, Docs and Sheets; gws-shared requires confirmation before any write or delete.',
    kind: 'command',
    commands: all([
      {
        run: skillsAdd('googleworkspace/cli', [
          'gws-shared',
          'gws-gmail',
          'gws-gmail-send',
          'gws-sheets',
          'gws-docs',
          'gws-calendar',
          'gws-drive',
        ]),
      },
    ]),
    docsUrl: 'https://github.com/googleworkspace/cli#ai-agent-skills',
  },
  {
    id: 'gcloud',
    title: 'Install the Google Cloud CLI (gcloud)',
    why: 'Lets `gws auth setup` create the Google Cloud project Google requires.',
    kind: 'command',
    commands: {
      windows: [
        {
          run: '(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\\GoogleCloudSDKInstaller.exe")',
        },
        {
          run: '& $env:Temp\\GoogleCloudSDKInstaller.exe',
          note: adminNote('opens Google’s installer window; click through it yourself.'),
        },
      ],
      macos: [
        {
          run: 'brew install --cask gcloud-cli',
          note: 'Homebrew cask (formulae.brew.sh/cask/gcloud-cli); Google’s page documents a download-and-extract install.',
        },
      ],
      linux: [
        {
          run: 'curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg',
          note: adminNote('asks for your password (Debian and Ubuntu).'),
        },
        {
          run: 'echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list',
          note: adminNote('asks for your password.'),
        },
        {
          run: 'sudo apt-get update && sudo apt-get install google-cloud-cli',
          note: adminNote('asks for your password.'),
        },
      ],
    },
    docsUrl: 'https://docs.cloud.google.com/sdk/docs/install',
  },
  {
    id: 'gws-auth',
    title: 'Connect gws to your Google account',
    why: 'Gives the agent your mail, calendar and files, limited to what you can see.',
    kind: 'human',
    commands: all([{ run: 'gws auth setup' }, { run: `gws auth login -s ${GWS_SERVICES}` }]),
    human: {
      instructions: [
        'Do this once, with whoever handles your IT. Plan 20 to 30 minutes.',
        '1. Run gws auth setup yourself and follow what it prints. If it asks for a client file from the Cloud Console, download it.',
        `2. Run gws auth login -s ${GWS_SERVICES}. Request only these services; asking for everything fails.`,
        '3. At “Google hasn’t verified this app”, click Continue, then allow access. This is expected for your own app.',
        'If gcloud will not install: in the Cloud Console, create a project, set the consent screen to External, add yourself under Test users, create a Desktop app OAuth client, save its file as ~/.config/gws/client_secret.json, then run step 2.',
      ].join('\n'),
      url: 'https://github.com/googleworkspace/cli#authentication',
    },
    docsUrl: 'https://github.com/googleworkspace/cli#authentication',
    warning: 'The hardest step here: if your company uses Google Workspace, the administrator may have to allow the app.',
  },

  // ── Document versioning ───────────────────────────────────────────────────
  {
    id: 'docs-walkthrough',
    title: 'Put a folder of documents under version control',
    why: 'Each version records what changed and why; you can return to any.',
    kind: 'human',
    commands: all([{ run: 'git init' }, { run: 'git add .' }, { run: 'git commit -m "Starting point"' }]),
    human: {
      instructions:
        'Open a terminal in one folder of documents (for example your offers) and run the three commands. From then on, ask your agent to save a version after each change.',
    },
    docsUrl: 'https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository',
  },
];

// COPY: owner review
export const goals: Goal[] = [
  {
    id: 'docs-versioning',
    label: 'Keep versions of my documents',
    summary: 'Track every change to contracts, offers and spreadsheets; restore any version.',
    stepIds: ['git-identity', 'docs-walkthrough'],
  },
  {
    id: 'websites',
    label: 'Build websites',
    summary: 'Build a website, host it on Cloudflare, keep the code on GitHub.',
    stepIds: [
      'git-identity',
      'github-account',
      'gh',
      'gh-login',
      'vite-plus',
      'cloudflare-account',
      'wrangler-login',
      'cloudflare-skills',
      'emil-skills',
    ],
  },
  {
    id: 'apps',
    label: 'Build apps',
    summary: 'One Flutter app for iPhone, Android, Windows and Mac.',
    stepIds: ['git-identity', 'github-account', 'gh', 'gh-login', 'flutter'],
  },
  {
    id: 'data-pipelines',
    label: 'Build data pipelines',
    summary: 'Turn exports and spreadsheets into the same report, with one command.',
    stepIds: ['git-identity', 'github-account', 'gh', 'gh-login', 'uv', 'python'],
  },
  {
    id: 'browser-automation',
    label: 'Automate the browser',
    summary: 'The agent clicks through portals, fills in forms and collects data.',
    stepIds: ['claude-in-chrome', 'agent-browser', 'agent-browser-skill'],
  },
  {
    id: 'existing-programs',
    label: 'Work in my existing programs',
    summary: 'Word, Excel, PowerPoint and PDF, plus Gmail, Calendar, Drive, Docs and Sheets.',
    stepIds: [
      'office-skills-claude-code',
      'office-skills',
      'claude-in-chrome',
      'gws',
      'gws-skills',
      'gcloud',
      'gws-auth',
    ],
  },
];
