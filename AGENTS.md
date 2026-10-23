# AGENTS.md

Ubiquitous Lamp is a client-only SvelteKit app for quick data actions on CSV and Excel files. All parsing runs in the browser, and the site deploys to GitHub Pages as static files.

## Stack

- SvelteKit 2 + Svelte 5 (runes only: `$state`, `$derived`, `$props`; no stores, no `export let`)
- Skeleton v4 (`@skeletonlabs/skeleton-svelte`) on Tailwind 4, theme `nosh`
- PapaParse for CSV, SheetJS (`xlsx`) for `.xls`/`.xlsx`
- Vitest 4 with two projects: `server` (Node) and `client` (Playwright Chromium)
- `@sveltejs/adapter-static`, everything prerendered

## Commands

```sh
npm ci              # install (engine-strict is on)
npm run dev         # dev server
npm run check       # svelte-check (type check)
npm run lint        # prettier --check + eslint
npm run format      # prettier --write + eslint --fix
npm test            # all Vitest projects, run once
npx vitest --project server   # unit tests only, no browser needed
npx playwright install chromium   # needed once for the client project
BASE_PATH=/ubiquitous-lamp npm run build   # production build, as CI runs it
```

Before you finish a change, run `npm run check`, `npm run lint` and `npm test`. CI runs all three on every PR and on `main` (see [.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

## Layout

```
src/
  app.html                         data-theme must match the theme imported in app.css
  lib/
    components/FileUploadHandler.svelte   shared upload → process → download UI
    utils/parse.ts                 Row type, header naming, countValues, sampleRows (pure)
    utils/tabular.ts               parseFile (CSV/Excel → rows), readColumns
    utils/download.ts              downloadCsv, fileStem
  routes/
    +layout.ts                     export const prerender = true
    +layout.svelte                 nav rail
    count/+page.svelte             value counts, optional group-by
    sample/+page.svelte            random row sampling, optional value filter
```

## How a tool page works

Each tool page renders `FileUploadHandler` and gives it callbacks:

- `onFileUpload(files)` runs as soon as the file selection changes. Use it to read columns or values so users can choose options _before_ processing.
- `processFile(file) => Promise<Row[]>` must be **pure**. Snapshot any page state it needs at the start, return rows, and never write page state. It runs once per file, concurrently.
- `onDownload(rows, fileName)` usually calls ``downloadCsv(rows, `${fileStem(fileName)}-<tool>.csv`)``.
- `canProcess` disables "Process All" until the required options are set.

To add a tool, copy this pattern:

1. Put the data logic in `src/lib/utils/` as a pure function, with tests.
2. Create the route.
3. Add it to `links` in `+layout.svelte` and `tools` in `routes/+page.svelte`.

Always read files through `parseFile`, so CSV and Excel both work. `Row` is `Record<string, string>`: every cell is a string, and output rows should be strings too (e.g. `Count: String(n)`).

`onFileUpload` is async. Use the existing `latestUpload` counter so a stale parse can't overwrite a newer selection. Store large row arrays with `$state.raw`, not `$state`.

## Conventions

- **Formatting:** Prettier with tabs, single quotes, no trailing commas, width 100. Don't hand-format; run `npm run format`.
- **Sorting:** ESLint `perfectionist` sorts imports, named imports, object keys, interface members and set literals alphabetically. `eslint --fix` handles most of it.
- **Modules:** declare `const` arrow functions and put a single `export { … }` at the bottom.
- **Types:** no `any`. Type component props with an interface.
- **Svelte:** key every `{#each}`. Use `SvelteSet`/`SvelteMap` rather than putting a `Set`/`Map` inside `$state`. Use function bindings (`bind:value={() => x, (v) => …}`) for side effects on change, not `onchange` combined with `bind:`.
- **Comments:** short, and only to explain _why_.

## Gotchas

- **Links must use `resolve()`** from `$app/paths` (e.g. `href={resolve('/count')}`). The site is served under `BASE_PATH` (`/ubiquitous-lamp`), so bare `/` hrefs break in production, and ESLint enforces this.
- **Use Skeleton v4's composed APIs.** Many examples online show v3 props, such as `<Progress size=…>`, which renders nothing in v4. Check the anatomy in `node_modules/@skeletonlabs/skeleton-svelte/dist/components/<name>/anatomy/`.
- **Install SheetJS only from the SheetJS CDN tarball** (see `package.json`). The npm-registry `xlsx` package is outdated and has known vulnerabilities, so never `npm i xlsx`.
- **Listbox click workaround:** the `onpointerdown` focus handler on `Listbox.Content` in `sample/+page.svelte` works around a zag bug where the first click misses when the list is partly off-screen. Keep it.
- **Keep `optimizeDeps.include`** in the client test project in `vite.config.ts`. Without it, a cold run (CI) re-optimizes mid-test, loads Svelte twice, and fails with `effect_orphan`.
- **Don't silence Svelte warnings globally** in `svelte.config.js`. Fix them instead.
- **Theme:** the theme name in `app.html` (`data-theme`) and the import in `app.css` must match.

## Tests

- **Unit tests** go in `*.spec.ts` (server project, Node) beside the code. Use them for anything in `src/lib/utils/`. `File` is available in Node, so `parseFile` can be tested directly. Build `.xlsx` fixtures in-test with `utils.aoa_to_sheet` + `write`.
- **Component tests** go in `*.svelte.spec.ts` (client project, real Chromium) and use `vitest-browser-svelte`'s `render` and `page` from `vitest/browser`. To upload files, call `page.elementLocator(input).upload(files)` on the hidden `input[type=file]`.
- **Assertions are required:** `expect.requireAssertions` is on, so every test must assert something.
- **Screenshots:** failure screenshots land in `__screenshots__/`, which is gitignored.
