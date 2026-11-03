# Development

How the code is organised and how to check changes. The reviewer summary is in the [README](../README.md).

## Start

```sh
npm install
npm run dev               # http://localhost:5173
npm run dev -- --host     # also reachable from a phone on the same Wi-Fi
npm run build             # static site in dist/
```

## Check your changes

```sh
npm test            # 27 tests of the price rules, checked against the client documents
npm run typecheck   # TypeScript errors
npm run e2e         # builds the site and clicks through a full order on a 390 px screen
```

`npm run e2e` uses the installed Microsoft Edge. Set `E2E_BROWSER=chrome` to use Chrome instead.

## Publish

```sh
npm run build
sh scripts/publish-gh-pages.sh dist
```

GitHub Pages serves the `gh-pages` branch at https://arda-sahin0.github.io/Fenster-Nord/.

## How the app works

Six steps, one question per screen, built for phones:

1. **Fenster:** size in cm, opening type, roller shutter, interior sill, quantity, with a live drawing to scale
2. **Auswahl:** all six systems with the total price for these windows; systems that don't fit are greyed out with the reason
3. **Ort:** postcode and highest floor, for the service-area and scaffolding notes
4. **Preis:** total incl. VAT and a line-by-line breakdown
5. **Anfrage:** contact form for the free on-site measurement
6. **Zusammenfassung:** shown on screen, nothing is sent

Progress is saved in the browser (`localStorage`), so a reload on the phone keeps the entered windows.

## Files

| File | What it does |
|---|---|
| [src/data/produktliste.csv](../src/data/produktliste.csv) | The client's product list, unchanged |
| [src/pricing/config.ts](../src/pricing/config.ts) | Every price and rule, with its source (client documents or the client's answers). |
| [src/pricing/products.ts](../src/pricing/products.ts) | Reads the CSV |
| [src/pricing/calculate.ts](../src/pricing/calculate.ts) | Size checks, window prices, discounts, installation, VAT, notes |
| [src/state.ts](../src/state.ts) | App state, saving in the browser, conversion from cm to the price input |
| [src/App.tsx](../src/App.tsx) | Step navigation and progress bar |
| [src/steps/](../src/steps/) | One file per screen; [WindowEditor.tsx](../src/steps/WindowEditor.tsx) is the form for one window |
| [src/components/](../src/components/) | Window drawing, price breakdown, animated price |
| [src/ui/texts.ts](../src/ui/texts.ts) | German wording for notes and errors |
| [src/styles.css](../src/styles.css) | All styles |
| [e2e/flow.mjs](../e2e/flow.mjs) | The end-to-end test |

## Project documents

| File | What it is for |
|---|---|
| [AGENTS.md](../AGENTS.md) | Rules for AI coding agents. `CLAUDE.md` loads it for Claude Code. |
| [document-review.md](document-review.md) | All 17 problems found in the client documents, with sources |
| [ai-log.md](ai-log.md) | Where AI tools got something wrong, and how it was noticed |
| [open-problems.md](open-problems.md) | What is still open |
| [windows-notes.md](windows-notes.md) | Windows pitfalls that cost time before |
| [run-report-template.md](run-report-template.md) | How to write up a real run, with evidence |
