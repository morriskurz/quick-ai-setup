# Design notes — creativecodecampus design system in quick-ai-setup

Reference for anyone (human or agent) changing the UI. The brand source is
`design-system/` (gitignored, content rights reserved); its `readme.md` is the
authority. Where anything here conflicts with it, the readme wins. Everything
the brand does not define and this site had to add is listed under
**Intentional additions**.

## Files

| Path | What it is |
| --- | --- |
| `src/styles/tokens/*.css` | Verbatim copies of `design-system/tokens/{colors,typography,spacing,effects,fonts}.css`. Never edit; `print.css` is not used. |
| `src/styles/index.css` | Imports the tokens, maps them to Tailwind v4 `@theme`, global base (ground, selection, focus ring, mobile basics). |
| `src/styles/components.css` | Styles for the DS primitives and page controls (`.ccc-*`). All hover rules sit behind `@media (hover: hover)`. |
| `src/components/ds/` | Typed ports: `Button`, `EyebrowLabel`, `GradientHeadline`, `MetaRow`, `Wordmark`, `NavBar`, `MotifBackdrop`. |
| `src/components/motif/` | `HeroMotif` (React host, lazy boot) and `scene.ts` (three.js port of `hero-3d.js`). |
| `src/components/ui/` | Page building blocks: `Section`, `Choice` (checkbox), `OsTabs`, `CodeBlock`, `CopyButton`. |
| `src/components/consulting.ts` | All consulting-section copy, links and photo config in one object (`// COPY: owner review`). |

## Tokens and roles

Tailwind's default palette, font stacks, radii, shadows and type scale are
cleared (`--color-*: initial` etc.), so only brand utilities exist.

| Utility | Token | Role |
| --- | --- | --- |
| `bg-page` | `--surface-page` `#010808` | The only ground. Dark only, no light theme. |
| `text-cyan`, `border-cyan-{08,18,35,50,70}` | `--ccc-cyan` `#7BC8E4` + alphas | The only chromatic UI colour: links, rules, active borders, the one solid CTA. |
| — | `--ccc-magenta` `#B82DBF` | Light source only (bloom, headline gradient end, 3D scene). **Not exposed as a utility on purpose.** Never a surface, border, button or text colour. |
| `text-ink-display` | `#F4FBFE` | Headlines. |
| `text-ink` | `#EAF6FA` | Default text, labels. |
| `text-ink-body` | white 70 % | Body copy. |
| `text-ink-nav` | white 62 % | Nav links, inactive tabs. |
| `text-ink-muted` | white 42 % | Meta lines only (non-interactive). |
| `border-hairline` | white 18 % | Every neutral border. Borders are always alpha hairlines. |
| `shadow-glow` / `shadow-glow-hover` | cyan light | Elevation — primary button only. No black shadows anywhere. |
| `rounded-sm` / `rounded-md` | 9px / 10px | Ghost button / everything else. Nothing is a pill or a circle. |
| `px-gutter` | `clamp(24px, 5vw, 64px)` | Page side padding. |
| `max-w-page` / `max-w-copy` / `max-w-measure` | 1440px / 640px / 50ch | Page, copy column, body measure. |
| `ease-brand` | `cubic-bezier(0.2, 0.7, 0.2, 1)` | The only easing. |

## Type scale

Schibsted Grotesk for everything structural; IBM Plex Mono only for eyebrows,
meta lines and code blocks — never for a sentence of prose.

| Utility | Size | Use |
| --- | --- | --- |
| `text-display` | `clamp(44px, 5.8vw, 80px)`, 700, −0.03em, lh 1.02 | Hero h1 only. |
| `text-section` | `clamp(30px, 3.4vw, 44px)`, 700, −0.025em, lh 1.08 | Section h2 (addition, see below). |
| `text-body` | 18px / 1.65 | Hero and section intros; step titles (600). |
| `text-ui` | 16px / 1.5 | Labels, step body, buttons. |
| `text-nav` | 15px | Nav, summaries, notes. |
| `text-eyebrow` | 13.5px mono, 0.14em, UPPERCASE | Eyebrow — the only uppercase in the brand. |
| `text-meta` | 13px mono, 0.02em | Meta rows, step numbers, code-block labels. |
| `text-code` | 13.5px mono / 1.7 | Code blocks and the prompt. |

Sentence case everywhere. Headlines are two short sentences with full stops;
the second carries the gradient (`GradientHeadline`). CTAs name what the
visitor gets — no arrows, no exclamation marks, no "Jetzt/Now".

## Motion

- **One entrance:** `ccc-up` (18px rise + fade), 0.85s on `--ccc-ease`.
  - Hero: `.ccc-enter` with `--enter-delay` staggered 0.10 / 0.22 / 0.32 / 0.44 / 0.56 / 0.68s (nav, eyebrow, headline, body, buttons, meta).
  - Below the fold: `Section` / `useReveal` — once per section via IntersectionObserver, never scroll-linked. Content is hidden only after JS arms it.
  - Fill mode is `backwards`, not `both`, so no transform lingers (a lingering transform would break `position: fixed` descendants).
- **Hover:** colour/opacity/border only, ~180ms. Nothing moves, scales or underlines on hover.
- **Press:** deeper ink on the lightened cyan. No scale, no translate (brand overrides the usual `scale(0.97)` advice).
- **State changes:** OS tab swap = 200ms opacity cross-fade (`.ccc-fade`). New prompt lines fade in and settle from cyan to their resting colour over 900ms (`.ccc-line-new`), and the prompt block scrolls the first new line into view. Mobile sheet opens with `grid-template-rows` 0fr→1fr over 280ms.
- **3D scene:** 0.15 rad/s rotation, per-layer 1.15s fade-in, ±0.028 bob. Pauses when off screen or the tab is hidden.
- **No parallax, ever.** No bounce, no spring, no attention loops.
- **`prefers-reduced-motion: reduce`:** no entrance or reveal animation, no cross-fade, no sheet transition, no smooth scrolling; new prompt lines keep the cyan colour cue without the fade; the 3D scene renders once fully faded in and holds still.

## Component APIs

```tsx
<Button variant="primary|secondary|ghost" small? href?>  // <a> when href, else <button type="button">
<EyebrowLabel rule? as? id?>Label</EyebrowLabel>
<GradientHeadline lead="First sentence." gradient="Second sentence." as="h1|h2|h3" size="display|section" id? />
<MetaRow items={['Proof one', 'Proof two']} />           // joined by a cyan middot at 80 %
<Wordmark size? href? />                                 // creativecode + cyan "campus", always lowercase
<NavBar links={[{label, href}]} cta={{label, href}} />   // links hidden <768px, CTA hidden <1024px
<MotifBackdrop motif?|src? scrim scrimNarrow? darken vignette grain as? />  // fixed layer order
<HeroMotif />                                            // lazy three.js scene, static wash fallback
<Section id eyebrow lead gradient intro?>…</Section>     // eyebrow + h2 + intro + one-time reveal
<Choice id checked onChange label summary? tag? warning? />
<OsTabs value onChange idBase panelId label />           // role=tablist, arrows/Home/End, roving tabindex
<CodeBlock code label context docsUrl? wrap? />          // Docs link + copy button in the header
<CopyButton getText label variant? small? />             // "Copied" for 1.6s, polite live region
```

## Motif (the only picture)

`scene.ts` is a TypeScript port of `design-system/assets/hero-3d.js`
(`buildScene` + the plain three.js mount loop). The esm.sh / React Three Fiber
CDN path, print compositions, frozen-frame mode and colour setter were dropped.
`three` is pinned (0.186.0) and only reachable through `import('./scene')`, so it
builds as a separate lazy chunk. `HeroMotif` boots it on IntersectionObserver
after probing WebGL; without WebGL it renders the source's static
cyan/magenta gradient wash. The hero copy is plain HTML and paints before
three.js is requested.

Hero layer stack (hero kit): ground → cyan/magenta bloom (`--ccc-bloom`) →
motif (right 78 %, `--ccc-motif-mask` from 768px) → scrim (`left` ≥768px,
`none` below) → vignette → 5 % grain.

The still PNG motifs are not available in this repo; the live scene is the motif.

## Do / don't

- Do use `bg-page`, hairline borders and cyan accents. Don't add any other background colour, gradient behind type, or purple-to-blue wash.
- Do protect text with scrims and vignettes. Don't use backdrop blur or solid cards behind text.
- Don't add cards except the hairline one (`.ccc-hairline-card`: 1px white-18 % on transparent, 10px radius).
- Don't use icons, emoji, pills, circles or bespoke SVG illustrations. Meaning is carried by type, hairlines and light.
- Don't use mono for sentences. Don't uppercase anything except the eyebrow.
- Don't animate on hover or press. Don't add parallax.
- Don't expose magenta as a utility colour.

## Intentional additions (not in the brand source)

1. **Focus ring** — the brand defines none. `:focus-visible` = 2px `--ccc-cyan-70` outline, 3px offset. Checkbox cards and segmented radios draw the ring on the row.
2. **Checkbox** (`.ccc-check`) — 20px hairline square, 4px radius (reads as square, never a circle). Checked = cyan fill behind a 3px ground-coloured inset ring: an instrument light instead of a tick icon. The real `<input type="checkbox">` stays in the DOM, visually hidden. Checked rows get a cyan-50 border and a cyan-08 tint (same language as ghost-button hover).
3. **Segmented control / tabs** (`.ccc-segment`) — hairline group, 7px inner radius, selected item = cyan-50 border + cyan-08 tint, white text. Used for the OS radio group and the OS tablists.
4. **Section headline size** (`text-section`, clamp 30–44px) — the source has one screen and no h2 size; display size would be too large for in-page sections.
5. **Code blocks** — hairline card, mono 13.5px/1.7 (the eyebrow size, so mono stays on the scale), header with meta label, "Docs" link and small ghost copy button. Commands scroll horizontally inside the block; markdown files wrap.
6. **Prose link underline** — `.ccc-link` keeps a persistent cyan-35 hairline underline so links are not told apart by colour alone (WCAG 1.4.1). Hover changes colour only, as the brand requires.
7. **Mobile bottom sheet** — ground-coloured bar with a hairline top border, `env(safe-area-inset-bottom)` padding, expands upward to show the prompt. Collapsed content is `inert`; Escape closes it.
8. **Phone composition for the motif** — below a 0.75 canvas aspect the source auto-fit pushes the stack off screen, so it sits smaller at the top right (`scale 0.42, x 0.75, y +1.5`), at 50 % opacity with a downward mask, behind the copy.
9. **Photography (consulting section)** — the brand's first photographic surface. **Owner override:** the brand readme (Imagery) says a photo "must be graded cool and dark and sit under the same vignette + grain"; the owner chose natural colour for his portrait instead. `.ccc-photo` therefore applies no filter, no cyan colour-blend tint, no vignette and no grain.
   Frame: hairline, 10px radius, no circle crop, no shadow; explicit width/height and `loading="lazy"`.
10. **Mobile basics** — `100svh` hero, `dvh` for the sheet, inputs at 16px, tap highlight off, `touch-action: manipulation` on controls, `viewport-fit=cover`, `theme-color` `#010808`.

## Content boundary

The UI consumes content only through `src/content/index.ts` and
`src/lib/generate.ts`. Page copy comes from `heroCopy`, `sectionCopy` and
`securityCopy` (`src/content/copy.ts`); `Section` takes a content `title` and
splits a two-sentence title into lead + gradient (`splitTitle`), while a
single-phrase title renders solid. Other exports in use: `globalInstructionFiles`
(house-rules file paths), `RTK_TELEMETRY_DOCS` (extras), `HOUSE_RULES_STEP_ID` /
`VERIFY_STEP_ID` (step rendering; the verify step shows `buildVerifyScript`),
`ADMIN_NOTE_PREFIX` + `needsAdmin` (administrator marker on commands). Not
rendered on purpose: `agentLoginStepIds`, `baselineBeforeAgentIds`,
`baselineAfterAgentIds` (plan ordering, used by `resolvePlan`), `NVM_VERSION`,
`FLUTTER_VERSION` (already inside the commands). `RichText` linkifies bare URLs
and renders `backticks` as inline mono in step text.

UI-owned copy with no content export (hero eyebrow and proof line, "Path one /
Path two" sub-headings, the house-rules eyebrow, small link labels, the
consulting section in `src/components/consulting.ts`) stays next to its
component, marked `// COPY: owner review`.

## Owner overrides after the AI-slop review (2026-09-24)

These deliberately depart from the creativecodecampus design system. Carry them into the
design-system project too, or other creativecodecampus pages keep the old patterns.

- **No gradient text.** The second headline sentence is solid `--ccc-cyan` (`.ccc-headline-accent`),
  replacing the `background-clip: text` gradient. `--ccc-text-gradient` is now unused.
- **Brighter text.** `--ccc-text-body` 0.70 → 0.95 alpha (14.7:1 on the ground);
  `--ccc-text-muted` 0.42 → 0.58 alpha (5.8:1, was 3.5:1 and failed WCAG AA).
- **No uppercase labels.** Eyebrow labels are sentence case with footnote tracking (0.02em).
  Section labels were removed where they repeated the headline; kept only on the hero
  ("Advanced AI setup for anyone") and "How to get started".
- **Kept on purpose:** the cyan glow on the primary button, the hero's scrims/vignette/bloom,
  and the numbered install steps (a real procedure, not filler).
