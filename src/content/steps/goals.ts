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
    why: 'Every saved version records a name and an email address. Git refuses to save versions until both are set.',
    kind: 'human',
    commands: all([
      { run: 'git config --global user.name "Your Name"' },
      { run: 'git config --global user.email you@example.com' },
    ]),
    human: {
      instructions:
        'Run both commands yourself, with your own name and work email in place of the examples. They are stored on this computer only.',
    },
    docsUrl: 'https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup',
  },
  {
    id: 'github-account',
    title: 'Create a GitHub account',
    why: 'GitHub stores your projects off your computer, with their full history. It is also where the agent opens changes for you to review.',
    kind: 'human',
    human: {
      instructions:
        'Go to github.com/signup and create an account with your work email. Skip this if you already have one.',
      url: 'https://github.com/signup',
    },
    docsUrl: 'https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github',
  },
  {
    id: 'gh',
    title: 'Install the GitHub CLI (gh)',
    why: 'gh lets the agent create the repository, open changes for review, and read why an automatic check failed, without you copying error messages around.',
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
    why: 'Signing in once lets gh and Git act on your account without asking for a password every time.',
    kind: 'human',
    commands: all([{ run: 'gh auth login' }]),
    human: {
      instructions:
        'Run the command yourself. Choose GitHub.com, then HTTPS, then “Login with a web browser”. The terminal shows a one-time code; enter it on the page that opens.',
      url: 'https://github.com/login/device',
    },
    docsUrl: 'https://cli.github.com/manual/gh_auth_login',
  },

  // ── Websites ──────────────────────────────────────────────────────────────
  {
    id: 'vite-plus',
    title: 'Install Vite+ (vp)',
    why: 'Vite+ is one toolchain that creates, runs, tests and builds a web project. It wraps Vite, Vitest, Rolldown and Oxlint; your site stays a normal Vite + React app. The settings below keep the Node.js you installed earlier and let Vite+ provide pnpm.',
    kind: 'command',
    commands: {
      windows: [
        {
          run: "$env:VP_NODE_MANAGER='no'; $env:VP_PM_MANAGER='no'; $env:VP_PNPM_MANAGER='yes'; irm https://vite.plus/ps1 | iex",
          note: 'The three settings are documented for the macOS/Linux installer; the Windows installer hands over to the same setup step. Untested on Windows.',
        },
      ],
      macos: [{ run: 'curl -fsSL https://vite.plus | VP_NODE_MANAGER=no VP_PM_MANAGER=no VP_PNPM_MANAGER=yes bash' }],
      linux: [{ run: 'curl -fsSL https://vite.plus | VP_NODE_MANAGER=no VP_PM_MANAGER=no VP_PNPM_MANAGER=yes bash' }],
    },
    docsUrl: 'https://viteplus.dev/guide/global-cli',
    warning:
      'Vite+ is a release candidate (1.0.0-rc.0), not a final release. If node or npm ever behave oddly after installing it, run `vp env off` to hand Node back to your own installation.',
  },
  {
    id: 'cloudflare-account',
    title: 'Create a Cloudflare account',
    why: 'Cloudflare hosts the finished site. New projects go on Workers with static assets, which Cloudflare now recommends over Pages, and small sites fit in the free plan.',
    kind: 'human',
    human: {
      instructions: 'Go to dash.cloudflare.com/sign-up and create an account. Skip this if you already have one.',
      url: 'https://dash.cloudflare.com/sign-up',
    },
    docsUrl: 'https://developers.cloudflare.com/workers/get-started/guide/',
  },
  {
    id: 'wrangler-login',
    title: 'Connect Wrangler to your Cloudflare account',
    why: 'Wrangler is Cloudflare’s deploy tool. Signing it in once lets the agent publish your site without handling any keys.',
    kind: 'human',
    commands: all([{ run: 'npx wrangler login' }, { run: 'npx wrangler whoami', note: 'Checks that the sign-in worked.' }]),
    human: {
      instructions:
        'Run npx wrangler login yourself. A browser tab asks you to allow Wrangler access to your account: allow it. Then run npx wrangler whoami to check.',
    },
    docsUrl: 'https://developers.cloudflare.com/workers/wrangler/commands/general/#login',
  },
  {
    id: 'cloudflare-skills',
    title: 'Add Cloudflare’s skills',
    why: 'Current instructions from Cloudflare on how to configure and deploy Workers, so the agent does not work from outdated examples.',
    kind: 'command',
    commands: all([{ run: skillsAdd('cloudflare/skills', ['cloudflare', 'wrangler', 'workers-best-practices']) }]),
    docsUrl: 'https://github.com/cloudflare/skills#installing',
  },
  {
    id: 'emil-skills',
    title: 'Add Emil Kowalski’s design skill',
    why: 'Specific rules for spacing, motion and interface detail. Without them, agents default to generic-looking pages.',
    kind: 'command',
    commands: all([{ run: skillsAdd('emilkowalski/skills', ['emil-design-eng']) }]),
    docsUrl: 'https://github.com/emilkowalski/skills#install',
  },

  // ── Apps ──────────────────────────────────────────────────────────────────
  {
    id: 'flutter',
    title: 'Install Flutter (includes Dart)',
    why: 'Flutter builds one app for iPhone, Android, Windows, macOS and the web from a single codebase. Dart, the language it uses, comes with it.',
    kind: 'command',
    commands: {
      windows: [
        {
          run: `Invoke-WebRequest -Uri https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_${FLUTTER_VERSION}-stable.zip -OutFile "$env:USERPROFILE\\Downloads\\flutter_windows_${FLUTTER_VERSION}-stable.zip"`,
          note: 'Downloads the Flutter bundle, about 1.9 GB.',
        },
        { run: 'New-Item -ItemType Directory -Force "$env:USERPROFILE\\develop" | Out-Null' },
        {
          run: `Expand-Archive -Path "$env:USERPROFILE\\Downloads\\flutter_windows_${FLUTTER_VERSION}-stable.zip" -DestinationPath "$env:USERPROFILE\\develop"`,
        },
        {
          run: "[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path','User') + \";$env:USERPROFILE\\develop\\flutter\\bin\", 'User')",
          note: 'Adds Flutter to your user PATH. Open a new terminal afterwards.',
        },
      ],
      macos: [{ run: 'brew install --cask flutter' }],
      linux: [
        {
          run: 'sudo apt-get install -y curl git unzip xz-utils zip libglu1-mesa',
          note: adminNote('asks for your password (Debian and Ubuntu).'),
        },
        {
          note: 'Downloads the Flutter bundle, about 1.6 GB.',
          run: `curl -fL -o ~/Downloads/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz`,
        },
        { run: `mkdir -p ~/develop && tar -xf ~/Downloads/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz -C ~/develop/` },
        {
          run: "echo 'export PATH=\"$HOME/develop/flutter/bin:$PATH\"' >> ~/.bashrc",
          note: 'For bash. zsh users add the same line to ~/.zshenv. Open a new terminal afterwards.',
        },
      ],
    },
    docsUrl: 'https://docs.flutter.dev/install/manual',
    warning:
      'Flutter has no one-line installer on Windows or Linux: you download an archive, extract it and add a folder to your PATH. Follow the steps in order and open a new terminal afterwards. Building for iPhone or Android later needs Xcode or Android Studio as well.',
  },

  // ── Data pipelines ────────────────────────────────────────────────────────
  {
    id: 'uv',
    title: 'Install uv',
    why: 'uv installs Python and the libraries a script needs, and records them, so the same script runs the same way next month and on a colleague’s computer.',
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
    why: 'Python is the standard language for working with data. uv installs its own copy without touching any Python already on your computer.',
    kind: 'command',
    commands: all([{ run: 'uv python install' }]),
    docsUrl: 'https://docs.astral.sh/uv/guides/install-python/',
  },

  // ── Browser automation ────────────────────────────────────────────────────
  {
    id: 'claude-in-chrome',
    title: 'Connect Claude in Chrome',
    why: 'Lets Claude Code use your normal Chrome, where you are already signed in to your portals. When it reaches a login page or a CAPTCHA, it stops and asks you.',
    kind: 'human',
    agents: ['claude-code'],
    human: {
      instructions:
        'Install the Claude extension from the Chrome Web Store. Then start Claude Code with claude --chrome, type /chrome and choose “Enabled by default”. If the extension is not detected the first time, restart Chrome. Needs a Pro, Max, Team or Enterprise plan and signing in with /login. Works in Chrome and Edge, not inside WSL.',
      url: 'https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn',
    },
    docsUrl: 'https://code.claude.com/docs/en/chrome',
  },
  {
    id: 'agent-browser',
    title: 'Install agent-browser',
    why: 'A browser the agent controls from the command line. It works with every agent on this page and needs no extension.',
    kind: 'command',
    commands: {
      windows: [{ run: 'npm install -g agent-browser' }, { run: 'agent-browser install' }],
      macos: [{ run: 'npm install -g agent-browser' }, { run: 'agent-browser install' }],
      linux: [
        { run: 'npm install -g agent-browser' },
        {
          run: 'agent-browser install --with-deps',
          note: adminNote('also installs system libraries through your package manager, which asks for your password.'),
        },
      ],
    },
    docsUrl: 'https://github.com/vercel-labs/agent-browser#installation',
    warning:
      'If no Chrome is found, `agent-browser install` downloads a separate Chrome for automation (Chrome for Testing): a second browser on your computer, several hundred MB.',
  },
  {
    id: 'agent-browser-skill',
    title: 'Add the agent-browser skill',
    why: 'Tells the agent how to drive agent-browser. The skill loads its instructions from the installed version, so they do not go out of date.',
    kind: 'command',
    commands: all([{ run: skillsAdd('vercel-labs/agent-browser', []) }]),
    docsUrl: 'https://github.com/vercel-labs/agent-browser#ai-coding-assistants-recommended',
  },

  // ── Existing programs ─────────────────────────────────────────────────────
  {
    id: 'office-skills-claude-code',
    title: 'Add Word and PowerPoint skills (Claude Code)',
    why: 'Lets the agent create and edit real Word and PowerPoint files. When you are signed in to Claude Code with a Claude account, the PDF and Excel skills are already there: they sync from your account automatically.',
    kind: 'command',
    agents: ['claude-code'],
    commands: all([{ run: skillsAdd('anthropics/skills', ['docx', 'pptx'], ['claude-code']) }]),
    docsUrl: 'https://code.claude.com/docs/en/skills',
  },
  {
    id: 'office-skills',
    title: 'Add Word, Excel, PowerPoint and PDF skills',
    why: 'Lets the agent create and edit real Word, Excel, PowerPoint and PDF files instead of plain text pretending to be one. Anthropic publishes these four as source-available, not open source.',
    kind: 'command',
    agents: ['codex', 'opencode'],
    commands: all([{ run: skillsAdd('anthropics/skills', ['docx', 'xlsx', 'pptx', 'pdf'], ['codex', 'opencode']) }]),
    docsUrl: 'https://github.com/anthropics/skills',
  },
  {
    id: 'gws',
    title: 'Install the Google Workspace CLI (gws)',
    why: 'gws is the program the Google Workspace skills call to read and send Gmail, manage your calendar, and work with Drive, Docs and Sheets. It is maintained in Google’s googleworkspace GitHub organisation, but its README states it is not an officially supported Google product.',
    kind: 'command',
    commands: all([{ run: 'npm install -g @googleworkspace/cli' }]),
    docsUrl: 'https://github.com/googleworkspace/cli#installation',
  },
  {
    id: 'gws-skills',
    title: 'Add the Google Workspace skills',
    why: 'Instructions for Gmail, Calendar, Drive, Docs and Sheets. gws-shared holds the sign-in and safety rules the others rely on, including “confirm with the user before any write or delete”.',
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
    why: 'Google requires every program that reads your mail to be registered in a Google Cloud project. With gcloud installed, `gws auth setup` creates that project for you instead of you clicking through the Cloud Console.',
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
          note: 'Homebrew cask (formulae.brew.sh/cask/gcloud-cli). Google’s own page documents a download-and-extract install instead.',
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
    why: 'This is where Google checks that you allow the agent to act on your mail, calendar and files. It runs on your own login, so the agent sees only what you can see.',
    kind: 'human',
    commands: all([{ run: 'gws auth setup' }, { run: `gws auth login -s ${GWS_SERVICES}` }]),
    human: {
      instructions: [
        'Do this once, together with whoever handles IT in your company. Plan 20 to 30 minutes.',
        '1. Run gws auth setup yourself. It signs you in to Google Cloud in the browser, creates a project, switches on the Google APIs and sets up the consent screen. Follow what it prints; if it asks you to download a client file from the Cloud Console, do that.',
        `2. Run gws auth login -s ${GWS_SERVICES}. Asking only for these services matters: an unverified app gets about 25 permissions, and asking for everything fails.`,
        '3. The browser says “Google hasn’t verified this app”. That is expected for a private app you created yourself: click Continue, then allow access.',
        'If gcloud will not install, the README describes a manual route in the Cloud Console: create a project, set the consent screen to External, add yourself under Test users, create a Desktop app OAuth client and save its file as ~/.config/gws/client_secret.json, then run step 2.',
      ].join('\n'),
      url: 'https://github.com/googleworkspace/cli#authentication',
    },
    docsUrl: 'https://github.com/googleworkspace/cli#authentication',
    warning:
      'The hardest step on this page. Google’s consent screen and test-user settings are easy to get wrong the first time. Do it with whoever handles your IT, and if your company uses Google Workspace, the administrator may have to allow the app.',
  },

  // ── Document versioning ───────────────────────────────────────────────────
  {
    id: 'docs-walkthrough',
    title: 'Put your first folder of documents under version control',
    why: 'Every saved state of a contract or offer gets a short message such as “client asked for 30-day payment terms”. Six months later you can see exactly what changed, when and why, and go back to any version.',
    kind: 'human',
    human: {
      instructions:
        'After the setup, open your agent in a folder of documents you want to track and ask: “Put this folder under version control with Git. Explain each step, then save the current state with the message ‘Starting point’.” From then on, ask it to save a version whenever you finish a change.',
    },
    docsUrl: 'https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository',
  },
];

// COPY: owner review
export const goals: Goal[] = [
  {
    id: 'docs-versioning',
    label: 'Keep versions of my documents',
    summary:
      'Track every change to contracts, offers and spreadsheets, so you can see who changed what and go back to any earlier version.',
    stepIds: ['git-identity', 'docs-walkthrough'],
  },
  {
    id: 'websites',
    label: 'Build websites',
    summary: 'Build a website and put it online on Cloudflare, with the code stored on GitHub.',
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
    summary: 'Build one app for iPhone, Android, Windows and Mac from a single codebase with Flutter.',
    stepIds: ['git-identity', 'github-account', 'gh', 'gh-login', 'flutter'],
  },
  {
    id: 'data-pipelines',
    label: 'Build data pipelines',
    summary:
      'Pull data out of exports, spreadsheets and systems, clean it, and produce the same report every time with one command.',
    stepIds: ['git-identity', 'github-account', 'gh', 'gh-login', 'uv', 'python'],
  },
  {
    id: 'browser-automation',
    label: 'Automate the browser',
    summary: 'Let the agent click through web portals, fill in forms and collect data in a browser.',
    stepIds: ['claude-in-chrome', 'agent-browser', 'agent-browser-skill'],
  },
  {
    id: 'existing-programs',
    label: 'Work in my existing programs',
    summary:
      'Let the agent read and write Word, Excel, PowerPoint and PDF files, and work in Gmail, Calendar, Drive, Docs and Sheets.',
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
