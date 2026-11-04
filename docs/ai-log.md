# AI log

Where an AI tool delivered something wrong, and how it was noticed. Source for the README section.

| Date | Tool | What was wrong | How it was noticed | Fix |
|---|---|---|---|---|
| 2026-11-03 | Claude Code | Listed "order of minimum area and fixed-glazing discount" as an open question. Both are multiplications on the same base, so the order cannot change the result. | Working out the numbers while writing the tests | Dropped from the questions; review item 5 now says why |
| 2026-11-03 | Claude Code | Picked Vite 6.3.5, a version with known security bugs | `npm audit` after install | Switched to 6.4.5 |
| 2026-11-03 | npm | `npm audit fix` claimed Vitest 3.2.7 fixes the issues; after installing it, it asked for Vitest 5.1.0 instead | Running `npm audit` again | Upgraded to Vitest 4.1.12 instead (0 vulnerabilities) |
| 2026-11-03 | Claude Code | Used `crypto.randomUUID()` for window IDs. It only exists on HTTPS pages, so testing on a phone over the local network (HTTP) would have crashed. | Code review before the first phone test | Simple ID from time and random number |
| 2026-11-03 | Claude Code | Linked to `bafa.de/beg` without knowing the page exists | Code review | Links to the BAFA homepage instead |
| 2026-11-03 | Claude Code | The click-through test read 2.941,30 € instead of 4.158,81 €. It read the price while the animation was still counting up. | Result didn't match the hand calculation; the breakdown was correct | Test reads the final value from `aria-label` |
| 2026-11-03 | Claude Code | Reported a background preview server as stopped; only the `npx` wrapper ended, the Node server kept running | Next server start failed: port already in use | Stop the Node process on the port itself |
| 2026-11-03 | Claude Code | The redesign left dead code: a note that every screen filtered out again, two components drawing the same window, invisible animated background shapes, unused CSS | Own review, then a scan for unused CSS classes and exports | Removed; scan now finds nothing unused |
| 2026-11-03 | Claude Code | Drew the tilt triangle with its point at the top. In German window drawings the point marks the hinges, so tilt (hinges at the bottom) needs the point at the bottom; point at the top means a top-hung window. | Arda looked at the tilt-turn icon and asked which way it opens | Triangle turned around |
| 2026-11-04 | Claude Code | The selected floor option grew from 20 to 32 px and covered the start of its text: `box-sizing: border-box` was set for elements but not for `::before`, so the thicker selected border added to the size | Arda saw it on the location screen | `box-sizing` now also applies to `::before` and `::after` |
| 2026-11-04 | Claude Code | The breakdown rounded the area to two decimals ("1,69 m²" for 120,5 × 140 cm = 1,687 m²), so the shown numbers did not recompute to the shown price (1,69 × 620 € = 1.047,80 €, shown 1.045,94 €). Even whole cm need up to four decimals. | Final scan: edge-case order on a 320 px screen, recomputed by hand | Whole cm only, area with up to four decimals; e2e checks that "120,5" is rejected |
| 2026-11-04 | Claude Code | "9 × 120 × 140 cm" for 9 windows of 120 × 140 cm reads like three dimensions | Same final scan, looking at the screenshots | "120 × 140 cm (9 Stück)" |
| 2026-11-04 | Claude Code | The installation line listed only "Anfahrt, Baustelleneinrichtung, Abdeckarbeiten"; customers could think the installation itself is missing | Final read-through | Line now starts with "Einbau der neuen Fenster" |
| 2026-11-03 | Claude Code | The end-to-end test compared "4.158,81 €" with a normal space; German number formatting uses a non-breaking space before "€" | Test failed although both values looked identical | Test normalises spaces before comparing |
