# Review of the client documents

Problems, conflicts and gaps found in the three documents from Fenster Nord. Reviewed 2026-11-03.

Sources:

| Short name | File | Notes |
|---|---|---|
| **Preise** | `Fenster-Nord_Preise-und-Produkte.pdf` | 1 page, "gültig ab 01.09.2026 · interne Arbeitsunterlage" |
| **Montage** | `Fenster-Nord_Montagebedingungen.pdf` | 1 page, "Stand 03/2026" |
| **CSV** | `Fenster-Nord_Produktliste.csv` | 7 lines: header + 6 systems, `;`-separated, ASCII, LF |

The PDFs have no line numbers, so they are cited by section and exact quote. CSV references are line numbers.

## Overview

| # | Problem | Source | Severity |
|---|---|---|---|
| 1 | Two different installation prices | Preise §"So wird der Preis berechnet" item 5 ↔ Montage §2 | **Blocking**: changes every price |
| 2 | "All triple-glazed windows qualify for BEG" is false for one system | Preise §"Unser Sortiment" ↔ CSV line 7 | **High**: false promise to customers |
| 3 | Only net prices for private customers | Preise header + last paragraph of pricing section | **High**: legal requirement |
| 4 | Every system can exceed 3 m², but the two-person surcharge has no price | Montage §3 ↔ CSV lines 2–7 | Medium |
| 5 | Unclear which items get the volume discount | Preise item 6 ↔ items 3, 4 | Medium |
| 6 | Interior window sill only in one document | Montage §2 | Medium |
| 7 | Is installation optional? | Preise item 5 | Medium |
| 8 | Internal sales note mixed with customer text | Preise header, §"Unser Sortiment" | Medium |
| 9 | Customers cannot measure "Außenmaß des Blendrahmens" | Preise §"Unser Sortiment" | Medium (UX) |
| 10 | Prices "nach Absprache" / unknown: outside service area, scaffolding, colours | Montage §4, §5; Preise §"Wichtig für Kunden" | Low: show as notes |
| 11 | Two-sash window has no minimum width | Preise item 3 ↔ CSV | Low |
| 12 | Unclear which systems allow which options | CSV (no columns for it) | Low |
| 13 | Rounding not defined | Preise | Low |
| 14 | Decimal commas, mixed precision | CSV lines 2–7, column 5 | Low (technical) |
| 15 | Minimum size differs per system | CSV lines 5, 6 | Low (technical) |
| 16 | Small windows cost up to 5× their area | Preise item 2 ↔ CSV | Low (explain to customer) |
| 17 | Uw value is for a standard size | CSV column 5 | Low |

Checked and correct: the example calculation (see "Verified" at the end).

---

## Details

### 1. Two different installation prices — blocking

**Preise**, section "So wird der Preis berechnet", item 5:
> "Montage: inklusive Ausbau und Entsorgung der Altfenster 180 € je Fenster."

**Montage**, section 2 "Preise" (table):
> "Montagepauschale je Auftrag (Anfahrt, Baustelleneinrichtung, Abdeckarbeiten) 450,00 €"
> "Ausbau und Entsorgung je Altfenster 60,00 €"
> "Einbau Fensterbank innen, je laufender Meter 38,00 €"

**Problem:** Both documents price the same work differently, and the installation terms contain no price for actually installing a new window. The documents allow three readings:

| Reading | Formula for *n* windows | 1 window | 4 windows | 10 windows |
|---|---|---|---|---|
| A: only Preise counts | 180 × n | 180 € | 720 € | 1,800 € |
| B: only Montage counts | 450 + 60 × n | 510 € | 690 € | 1,050 € |
| C: flat fee + per-window price | 450 + 180 × n | 630 € | 1,170 € | 2,250 € |

The difference for one window is up to 450 € net.

**Dates:** Preise is valid from 01.09.2026, Montage is dated 03/2026. Preise is newer and written for private customers, but it doesn't say that it replaces the installation terms.

**Question for the client:** Which reading is correct?
**Working assumption:** Reading A (newer document, written for private customers). Keep all three in one config setting so it's a one-line change.

### 2. False subsidy claim (BEG/BAFA)

**Preise**, section "Unser Sortiment", paragraph 2:
> "Alle 3-fach-Fenster aus unserem Sortiment erfüllen die Anforderungen der BEG-Förderung und können über das BAFA bezuschusst werden. Das ist für viele Kunden ein starkes Kaufargument und sollte im Angebot deutlich erscheinen."

**CSV** column 5 `uw_w_m2k`:
- line 7: `FN-A75-3;Aluminiumfenster Slim 75;…;3-fach;1,0;…` → **Uw 1.0**
- line 5: `FN-H68-3;Holzfenster Nordic 68;…;3-fach;0,95;…` → **Uw 0.95**, exactly on the limit

**Problem:** The BEG technical minimum requirement for windows is Uw ≤ 0.95 W/(m²K). Slim 75 is triple-glazed but has Uw 1.0, so the claim is false for it. Nordic 68 only just qualifies.

Further points:
- A BEG grant for windows also needs an energy-efficiency expert (Energieeffizienz-Experte) and an application before the order. "Can be subsidised" is not the same as "will be subsidised".
- The document asks for the claim to appear prominently. A false subsidy promise in an offer to consumers is a risk under unfair-competition law (UWG §5, misleading statements).
- Subsidy rules change often. Check the current requirements on bafa.de before relying on the 0.95 value.

**Question for the client:** Should the subsidy note appear only for systems with Uw ≤ 0.95?
**Working assumption:** Yes. Show it only for Uw ≤ 0.95, as "possibly eligible", with a link to BAFA and a note that an energy consultant is needed. No amount.

### 3. Only net prices for private customers

**Preise**, header:
> "Preise und Produkte · Privatkunden · gültig ab 01.09.2026"

**Preise**, last paragraph of the pricing section:
> "Alle Preise in dieser Unterlage und in der Produktliste sind Nettopreise zuzüglich gesetzlicher Umsatzsteuer."

**Problem:** The target group is private customers. In Germany, prices shown to consumers must be total prices including VAT (Preisangabenverordnung §3). A net-only price also looks 19 % cheaper than it is.

**Question for the client:** Is it fine to show gross prices?
**Working assumption:** Show the gross total as the main figure, with net amount and VAT (19 %) in the breakdown.

### 4. Large elements: rule without a price

**Montage**, section 3:
> "Elemente mit mehr als 3,0 m² Fläche werden aus Sicherheitsgründen grundsätzlich in Zwei-Mann-Montage eingebaut."

**Problem:** No price is given. According to the CSV size limits, **every** system can exceed 3 m²:

| CSV line | System | Largest size | Area |
|---|---|---|---|
| 2 | Classic 70 | 1800 × 2200 | 3.96 m² |
| 3–4 | Therm 82 / Plus | 2000 × 2400 | 4.80 m² |
| 5 | Nordic 68 | 1800 × 2200 | 3.96 m² |
| 6 | Duo 78 | 2400 × 2400 | 5.76 m² |
| 7 | Slim 75 | 2400 × 2600 | 6.24 m² |

**Question for the client:** Is there a surcharge for two-person installation?
**Working assumption:** No surcharge in the estimate. Over 3 m², show a note that the price will be confirmed during the on-site measurement.

### 5. Volume discount: unclear what it covers

**Preise**, item 6:
> "Mengenrabatt: ab 10 Fenstern in einem Auftrag 5 % auf die Fensterpreise (nicht auf Montage)."

**Problem:** It's clear that installation is excluded. It is not clear whether "Fensterpreise" (window prices) includes:
- the two-sash surcharge, "120 € Aufpreis je Fenster" (item 3),
- the roller shutter, "95 € je laufendem Meter" (item 4).

The order of the fixed-glazing discount (−15 %) and the volume discount (−5 %) doesn't matter, because both are percentages on the same base. What matters is the base.

**Question for the client:** Does the 5 % also apply to the two-sash surcharge and the roller shutter?
**Working assumption:** Only on the window price after the minimum area and fixed-glazing discount; not on surcharges, roller shutter or installation.

### 6. Interior window sill only in one document

**Montage**, section 2:
> "Einbau Fensterbank innen, je laufender Meter 38,00 €"

**Problem:** The price sheet doesn't mention window sills at all. It's unclear whether they are part of the offer or an optional extra, and whether 38 €/m includes the sill itself or only installing it.

**Working assumption:** Optional extra, asked as a yes/no question per window and priced at window width × 38 €/m.

### 7. Is installation optional?

**Preise**, item 5, lists installation as a price item but doesn't say whether customers can order windows without it.

**Working assumption:** Installation is always included. Fenster Nord is an installer, and the request ends with an on-site visit.

### 8. Internal sales note mixed with customer text

**Preise**, header:
> "interne Arbeitsunterlage"

**Preise**, section "Unser Sortiment":
> "Das ist für viele Kunden ein starkes Kaufargument und sollte im Angebot deutlich erscheinen."

**Problem:** This is an instruction to sales staff, while the section "Wichtig für Kunden" in the same document is meant for customers. Text must not be copied into the app one to one.

**Working assumption:** Use only the rules and the "Wichtig für Kunden" points as customer text.

### 9. Measurement customers can't take

**Preise**, section "Unser Sortiment":
> "Alle Maße in der Produktliste sind Außenmaße des Blendrahmens in Millimetern."

**Problem:** A homeowner can't measure the outer frame size of a window that doesn't exist yet. They can measure their old window, roughly. The example in the same document uses centimetres ("120 × 140 cm"), the CSV uses millimetres.

**Working assumption:** Ask for width × height in cm of the existing window, with a short measuring hint. Say clearly that the free on-site measurement sets the exact size.

### 10. Prices "nach Absprache" or unknown

| Source | Quote | In the app |
|---|---|---|
| Montage §4 | "Wir montieren im Postleitzahlengebiet 20000 bis 25999 ohne Aufpreis. Für Aufträge außerhalb dieses Gebiets berechnen wir einen Anfahrtszuschlag nach Absprache." | Ask for the postcode; outside the area, show a note without a price |
| Montage §5 | "Bei Fenstern ab dem 2. Obergeschoss kann ein Gerüst nötig sein. Das klären wir beim Aufmaß." | Ask for the floor; from the 2nd floor, show a note |
| Montage §1 | "Malerarbeiten sind nicht enthalten." | Show under "not included" |
| Preise §"Wichtig für Kunden" | "Farben: Weiß ist Standard. Andere Farben und Dekore auf Anfrage." | White only; note "other colours on request" |

### 11. Two-sash window without a minimum width

**Preise**, item 3:
> "Zweiflügelig mit Stulp: 120 € Aufpreis je Fenster."

**Problem:** The CSV allows windows from 400 mm wide (lines 2–4, 7). A two-sash window that narrow isn't realistic, but there's no limit.

**Question for the client:** From what width is a two-sash window possible?
**Working assumption:** Offer it only from 800 mm width. Mark this as my own assumption.

### 12. Unclear which systems allow which options

**CSV** has no columns for opening types, roller shutter or colours.

**Working assumption:** All options are available for all six systems.

### 13. Rounding not defined

**Preise** doesn't say how to round the area or the prices.

**Working assumption:** Don't round the area. Round each line item to whole cents. The document's own example gives the same result.

### 14. CSV: decimal commas and mixed precision

**CSV** column 5 `uw_w_m2k`, lines 2–7: `1,1` · `0,90` · `0,72` · `0,95` · `0,82` · `1,0`

**Problem:** German decimal comma, and the number of decimals varies (1,1 vs 0,90). There's no parsing problem because the separator is `;`, but the code must convert `,` to `.`. In the app, show two decimals everywhere.

### 15. CSV: minimum size differs per system

**CSV** lines 5 and 6 (Nordic 68, Duo 78): minimum width and height **450 mm**. All other systems: **400 mm**.

**In the app:** Check the size limits per system, and grey out systems that don't fit, with the reason.

### 16. Small windows cost up to 5× their area

**Preise**, item 2:
> "Fenster unter 0,8 m² werden mit 0,8 m² berechnet."

The smallest allowed window (CSV: 400 × 400 mm) has 0.16 m² but is charged as 0.8 m², five times its area. That's the client's rule, not an error, but customers will be surprised.

**In the app:** Show "charged at the minimum area of 0.8 m²" in the breakdown.

### 17. Uw value is for a standard size

**CSV** column 5: Uw values are usually measured on a standard test size (1.23 × 1.48 m). Real windows of other sizes have slightly different values, which matters for a system on the limit like Nordic 68 (0.95).

**In the app:** Phrase the subsidy note carefully ("possibly eligible").

---

## Verified, no problem

- **Example calculation** (Preise, box "Beispiel"): 1.20 m × 1.40 m = 1.68 m²; 1.68 × 395 € = 663.60 €. Correct, and it matches CSV line 3 (Therm 82, 395 €/m²). Used as the first test case.
- **CSV format:** `;`-separated, ASCII, no BOM, LF line endings, 6 data rows, no empty or missing values.
- **Classic 70** (CSV line 2, double-glazed, Uw 1.1): no subsidy claim is made for it. That's consistent.

## Questions for the client (draft, German)

1. **Montage:** Im Preisblatt (gültig ab 09/2026) steht 180 € je Fenster inkl. Ausbau und Entsorgung. In den Montagebedingungen (Stand 03/2026) stehen 450 € Pauschale je Auftrag und 60 € je Altfenster. Welche Regel gilt – oder werden beide kombiniert?
2. **BEG-Förderung:** Laut Preisblatt sind alle 3-fach-Fenster förderfähig. Das Aluminiumfenster Slim 75 hat aber Uw 1,0; für die BEG sind höchstens 0,95 nötig. Soll der Förderhinweis nur bei Systemen bis 0,95 erscheinen?
3. **Bruttopreise:** Darf der Rechner für Privatkunden Preise inkl. 19 % USt anzeigen?
4. **Mengenrabatt:** Gelten die 5 % auch auf Stulp-Aufpreis und Rollladen?
5. **Große Fenster:** Gibt es für die Zwei-Mann-Montage über 3 m² einen Aufpreis?
6. **Fensterbank innen:** Gehört sie zum Angebot, und ist die Fensterbank selbst in den 38 €/m enthalten?
7. **Stulp:** Ab welcher Breite ist ein zweiflügeliges Fenster möglich?
