# Fenster-Nord

Online price estimator for the (fictional) window maker Fenster Nord GmbH: homeowners enter their windows on their phone, get a traceable estimate and request a free on-site measurement.

## Start

```sh
npm install
npm run dev         # http://localhost:5173
npm run build       # static site in dist/
```

## Check your changes

```sh
npm test            # price rules, checked against the client documents
npm run typecheck   # TypeScript errors
```

## How the app works

Six steps, one question per screen, built for phones:

1. **Fenster:** size in cm, opening type, roller shutter, interior sill, quantity
2. **Auswahl:** all six systems with the total price for these windows; systems that don't fit are greyed out with the reason
3. **Ort:** postcode and highest floor, for the service-area and scaffolding notes
4. **Preis:** total incl. VAT and a line-by-line breakdown
5. **Anfrage:** contact form for the free on-site measurement
6. **Zusammenfassung:** shown on screen, nothing is sent

Design decisions:

- The price comes before the contact form, so nobody has to leave a phone number just to see a price.
- One system for the whole order. That matches how people renovate, and it keeps the comparison simple.
- Progress is saved in the browser, so a reload on the phone keeps the entered windows.

## How the price is calculated

| File | What it does |
|---|---|
| [src/data/produktliste.csv](src/data/produktliste.csv) | The client's product list, unchanged |
| [src/pricing/config.ts](src/pricing/config.ts) | Every price and rule, with its source. Open questions are marked `OPEN`. |
| [src/pricing/products.ts](src/pricing/products.ts) | Reads the CSV |
| [src/pricing/calculate.ts](src/pricing/calculate.ts) | Size checks, window prices, discounts, installation, VAT, notes |
| [src/App.tsx](src/App.tsx) | Step navigation and app state |
| [src/steps/](src/steps/) | One file per screen |
| [src/ui/texts.ts](src/ui/texts.ts) | German wording for notes and errors |

## Project files

| File | What it is for |
|---|---|
| [AGENTS.md](AGENTS.md) | Rules for AI coding agents. `CLAUDE.md` loads it for Claude Code. |
| [docs/document-review.md](docs/document-review.md) | Problems found in the client documents, with sources |
| [docs/ai-log.md](docs/ai-log.md) | Where AI tools got something wrong, and how it was noticed |
| [docs/open-problems.md](docs/open-problems.md) | What still blocks or weakens the project, with an owner each |
| [docs/run-report-template.md](docs/run-report-template.md) | How to write up a real run, with evidence |
| [docs/windows-notes.md](docs/windows-notes.md) | Windows pitfalls that cost time before |
| [scripts/publish-gh-pages.sh](scripts/publish-gh-pages.sh) | Publish a built folder to the `gh-pages` branch |
