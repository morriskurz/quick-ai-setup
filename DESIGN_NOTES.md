# Design notes — creativecodecampus design system

**Status: NOT YET PULLED.** The foundation session could not read the
creativecodecampus design-system project (claude.ai design-system project
`68aa52d3-5b70-4e91-946c-7659fdb2ad8f`): the `DesignSync` tool was not available
to that agent. Nothing below is filled in, on purpose.

## Rules until the design system is pulled

- **Do not invent tokens.** No made-up custom property names, colours, font
  families, radii, easings or durations presented as "the DS". The real names come
  from `tokens/*.css` in the DS project.
- `src/styles/index.css` imports Tailwind only. There is no `src/styles/tokens/`
  and no `@theme` mapping yet.
- `src/components/ds/` is empty. Button, EyebrowLabel, GradientHeadline, MetaRow,
  Wordmark, NavBar and MotifBackdrop still need porting from the DS source and its
  `.d.ts` props.
- UI work done before the pull should keep styling minimal and easy to swap:
  Tailwind utilities on structure and layout, no bespoke palette.

## To finish (needs a session with DesignSync)

1. Pull every DS file except `uploads/` and `.thumbnail` files into
   `design-system/` (gitignored) with the DesignSync read methods `list_files` and
   `get_file`.
2. Copy the token CSS verbatim into `src/styles/tokens/`, import it from
   `src/styles/index.css`, and expose it through Tailwind v4 `@theme`.
3. Set up fonts exactly as `tokens/fonts.css` specifies.
4. Port the seven components to typed React in `src/components/ds/`. Keep
   `hero-3d.js` / WebGL lazy-loaded and respect `prefers-reduced-motion`.
5. Replace this file with the real reference: colour tokens and their roles, type
   scale, spacing and radii, motion rules, motif and gradient rules, component
   APIs, and do/don't rules.
