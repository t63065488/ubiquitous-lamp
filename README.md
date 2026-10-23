# Ubiquitous Lamp

Quick data actions for CSV and Excel files, right in your browser.

**Live site:** <https://t63065488.github.io/ubiquitous-lamp/>

Files are parsed in the browser and never leave your machine. There is no server and no upload.

## Tools

| Tool       | What it does                                                                                                                                                                                    | Output              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **Count**  | Counts how often each value appears in a column. You can also group the counts by a second column. Results are sorted by group, then by count from highest to lowest.                           | `<file>-counts.csv` |
| **Sample** | Takes a random percentage of rows (at least one row). You can limit the sample to rows whose value in a column matches the values you pick, and you can add the original rows below the sample. | `<file>-sample.csv` |

Both tools accept `.csv`, `.xls` and `.xlsx` files, and you can select several files at once. Each file is processed separately and gets its own CSV download.

### Using a tool

1. Open the tool from the nav rail or the home page.
2. Choose one or more files. The column options fill in from the file headers.
3. Set the options, then click **Process All**.
4. Download the result for each file.

## Development

You need Node.js 22, which is what CI uses. `engine-strict` is on, so `npm ci` fails on an unsupported Node version.

```sh
npm ci                              # install dependencies
npm run dev                         # start the dev server
```

### Checks

CI runs these on every pull request and on `main`. Run them before you open a PR:

```sh
npm run check                       # type check (svelte-check)
npm run lint                        # prettier --check + eslint
npm test                            # all Vitest projects, run once
```

`npm run format` fixes most formatting and lint problems on its own.

Tests run in two Vitest projects:

- **server**: unit tests (`*.spec.ts`) in Node. Run them alone with `npx vitest --project server`.
- **client**: component tests (`*.svelte.spec.ts`) in real Chromium through Playwright. Before your first run, install the browser with `npx playwright install chromium`.

### Building

The site is a fully prerendered static build served from `/ubiquitous-lamp`. To build it the way CI does:

```sh
BASE_PATH=/ubiquitous-lamp npm run build
npm run preview                     # serve the build locally
```

Pushes to `main` deploy to GitHub Pages through [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Stack

- [SvelteKit 3](https://svelte.dev/docs/kit) and [Svelte 5](https://svelte.dev/docs/svelte) (runes), using `adapter-static`
- [Skeleton v5](https://www.skeleton.dev/) on [Tailwind CSS 4](https://tailwindcss.com/)
- [PapaParse](https://www.papaparse.com/) for CSV and [SheetJS](https://sheetjs.com/) for Excel
- [Vitest 5](https://vitest.dev/) with Playwright browser mode

> [!NOTE]
> SheetJS is installed from the SheetJS CDN tarball, not the npm registry. The `xlsx` package on npm is outdated and has known vulnerabilities, so don't run `npm i xlsx`.

## Project layout

```
src/
  lib/
    components/FileUploadHandler.svelte   shared upload → process → download UI
    utils/parse.ts                        Row type, countValues, sampleRows
    utils/tabular.ts                      parseFile (CSV/Excel → rows), readColumns
    utils/download.ts                     downloadCsv, fileStem
  routes/
    +page.svelte                          home page and tool list
    +layout.svelte                        nav rail
    count/+page.svelte                    Count tool
    sample/+page.svelte                   Sample tool
```

## Adding a tool

1. Write the data logic as a pure function in `src/lib/utils/`, with unit tests next to it.
2. Add a route that renders `FileUploadHandler` and passes it `processFile`, `onFileUpload` and `onDownload`.
3. Register the tool in `links` in `src/routes/+layout.svelte` and in `tools` in `src/routes/+page.svelte`.

[AGENTS.md](AGENTS.md) covers the callback contract, coding conventions and known gotchas in detail. Read it before you make larger changes.
