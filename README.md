# quick-ai-setup

Source for [ai.creativecodecampus.com](https://ai.creativecodecampus.com): a single
page that takes a non-technical business user from no AI setup to a working AI
coding setup. Tick what you want to achieve; the page produces one prompt to paste
into a coding agent, or the same steps as commands to run yourself.

See [SPEC.md](SPEC.md) for the specification and [RESEARCH.md](RESEARCH.md) for the
tool research.

## Develop

Requires Node 24 (`.nvmrc`) and pnpm.

```bash
pnpm install
pnpm dev         # local dev server
pnpm test        # unit tests (Vitest)
pnpm typecheck   # TypeScript
pnpm lint        # oxlint
pnpm build       # production build into dist/
pnpm preview     # serve dist/ locally
```

## Deploy

Cloudflare Workers with Static Assets (`wrangler.jsonc`), custom domain
`ai.creativecodecampus.com`.

```bash
pnpm build && pnpm exec wrangler deploy
```

## License

Split licence — see [LICENSE](LICENSE):

- **Code**: MIT.
- **Content** (site text, curated recommendations) and **creativecodecampus
  branding/assets**: all rights reserved.
