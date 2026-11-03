# AI log

Where an AI tool delivered something wrong, and how it was noticed. Source for the README section.

| Date | Tool | What was wrong | How it was noticed | Fix |
|---|---|---|---|---|
| 2026-11-03 | Claude Code | Listed "order of minimum area and fixed-glazing discount" as an open question. Both are multiplications on the same base, so the order cannot change the result. | Working out the numbers while writing the tests | Dropped from the questions; review item 5 now says why |
| 2026-11-03 | Claude Code | Picked Vite 6.3.5, a version with known security bugs | `npm audit` after install | Switched to 6.4.5 |
| 2026-11-03 | npm | `npm audit fix` claimed Vitest 3.2.7 fixes the issues; after installing it, it asked for Vitest 5.1.0 instead | Running `npm audit` again | Upgraded to Vitest 4.1.12 instead (0 vulnerabilities) |
