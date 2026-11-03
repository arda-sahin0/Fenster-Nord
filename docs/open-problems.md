# Open problems

What still blocks or weakens the project. Updated: 2026-11-03.

When you fix one, move it to **Solved** with the commit hash.

Details and sources for each item: [document-review.md](document-review.md).

## Blocking

| # | Problem | Why it matters | Owner | Next step |
|---|---|---|---|---|
| 1 | Two installation prices: 180 €/window (Preise) vs. 450 € flat + 60 €/old window (Montage) | Changes every price by up to 450 € net | Client | Ask the client; until then use 180 €/window, switchable in config |
| 2 | "All triple-glazed windows qualify for BEG" is false for Slim 75 (Uw 1.0 > 0.95) | False subsidy promise to customers | Client | Ask the client; show the note only for Uw ≤ 0.95 |
| 3 | Only net prices for private customers | Consumer prices must include VAT | Client | Ask the client; show gross prices with net and VAT in the breakdown |

## Smaller items

- Volume discount: unclear whether it covers the two-sash surcharge and roller shutter (review item 5).
- Two-person installation over 3 m² has no price (review item 4).
- Interior window sill only in the installation terms (review item 6).
- Two-sash window has no minimum width (review item 11).
- Questions to the client not sent yet.
- `npm audit`: 3 warnings in the test tool Vitest 3.2.7 (not in the website). Fixed only in Vitest ≥ 4.1.11, a major upgrade. Decide whether to upgrade.

## Solved

-
