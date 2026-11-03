# Open problems

What still blocks or weakens the project. Updated: 2026-11-03.

When you fix one, move it to **Solved** with the commit hash.

Details and sources for each item: [document-review.md](document-review.md).

## Blocking

None.

## Smaller items

- Interior window sill: own assumption that it is an optional extra and not discounted (review item 6).
- Two-sash windows only from 80 cm width: own assumption (review item 11).
- Reviewers need access to the code: GitHub's public API showed the repo as private. Make it public or invite the reviewers.

## Solved

- `npm audit` warnings in the test tool: upgraded Vitest 3.2.7 → 4.1.12, 0 vulnerabilities. (b65840b)
- Installation price, subsidy note, VAT, volume discount and large elements: settled by the client's answers on 2026-11-03, see document-review.md. (447ce89)
- Commit history rewritten with the private noreply email and force-pushed; GitHub shows only the noreply address.
- Demo online at https://arda-sahin0.github.io/Fenster-Nord/.
- BEG limit Uw ≤ 0.95 for windows: confirmed by the client and by several secondary sources (EnBW, reduco.ai). Not checked against the official BEG EM annex; the downloaded BAFA leaflet was the 2020 heating leaflet, which has no window values.
