# Fenster Nord – Richtpreis-Rechner

Hauseigentümer geben am Handy ihre Fenster ein, sehen einen nachvollziehbaren Richtpreis inkl. MwSt. und fragen danach ein kostenloses Aufmaß an.

**Demo:** https://arda-sahin0.github.io/Fenster-Nord/ · **Code:** https://github.com/arda-sahin0/Fenster-Nord

```sh
npm install && npm run dev   # lokal starten
npm test                     # 27 Tests der Preisregeln, erster Test = Beispiel aus dem Preisblatt (663,60 €)
npm run e2e                  # klickt eine komplette Bestellung am Handy-Format durch und prüft jeden Betrag
```

Aufbau und Dateien: [docs/development.md](docs/development.md)

## Mit Fenster Nord geklärt

Die Widersprüche in den Unterlagen habe ich per Rückfrage geklärt, statt sie selbst zu entscheiden. Alle Regeln stehen mit Quelle an einer Stelle: [config.ts](src/pricing/config.ts).

| Frage | Antwort von Fenster Nord |
|---|---|
| Welcher Montagepreis gilt? | 450 € Pauschale je Auftrag + 60 € je Altfenster; die 180 € je Fenster sind veraltet |
| Förderhinweis bei allen 3-fach-Fenstern? | Nur bei Uw ≤ 0,95, ohne Betrag, mit Hinweis: Antrag vor der Auftragsvergabe |
| Brutto oder netto? | Inkl. 19 % USt., netto zusätzlich |
| Worauf gilt der Mengenrabatt? | Auf den Fensterpreis inkl. Öffnungsart (also auch Stulp-Aufpreis), nicht auf Rollladen und Montage |
| Aufpreis für Zwei-Mann-Montage über 3 m²? | Keiner; klar ausweisen, dass der Preis beim Aufmaß festgelegt wird |

## Eigene Annahmen und warum

| Annahme | Warum |
|---|---|
| Je neuem Fenster wird ein Altfenster ausgebaut | Der Rechner ist für den Austausch gedacht |
| Fensterbank innen (38 €/m) als Extra, nicht im Mengenrabatt | Steht in den Montagebedingungen; der Rabatt gilt laut Antwort nur auf Fensterpreis und Öffnungsart |
| Zweiflügelig erst ab 80 cm Breite | Keine Angabe; schmaler ist technisch kaum sinnvoll |
| Ein Fenstersystem für den ganzen Auftrag | So wird meist renoviert, und der Vergleich der Systeme bleibt einfach |
| Maße in cm am alten Fenster | Laien können das Außenmaß eines neuen Blendrahmens nicht messen; das Aufmaß korrigiert es |
| Preis vor dem Kontaktformular | Wer erst seine Telefonnummer abgeben muss, bricht eher ab |

## Was mir an den Unterlagen aufgefallen ist

1. **Zwei Montagepreise:** 180 € je Fenster (Preisblatt) gegen 450 € Pauschale + 60 € je Altfenster (Montagebedingungen). Bei einem Fenster sind das 180 € gegen 510 €. Das neuere Preisblatt war hier das veraltete.
2. **Falsches Förderversprechen:** „Alle 3-fach-Fenster sind BEG-förderfähig“ stimmt nicht. Slim 75 hat Uw 1,0, gefordert sind höchstens 0,95. Laut Preisblatt soll das „deutlich erscheinen“, ein Risiko im Wettbewerbsrecht.
3. **Nur Nettopreise**, obwohl die Zielgruppe Privatkunden sind.
4. **Regeln ohne Preis:** Zwei-Mann-Montage über 3 m² (jedes System kann größer sein), Anfahrt außerhalb PLZ 20000–25999, Gerüst ab dem 2. OG.
5. **Interne Notizen gemischt mit Kundentext:** Das Preisblatt ist eine „interne Arbeitsunterlage“; Vertriebshinweise dürfen nicht 1:1 in die App.

Alle 17 Punkte mit Fundstelle und Zitat: [docs/document-review.md](docs/document-review.md)

## Wo die KI falsch lag

| Fehler | Wie ich es gemerkt habe |
|---|---|
| Eine Rückfrage war keine: Reihenfolge von Mindestfläche und Festverglasungs-Rabatt. Beides sind Multiplikationen, die Reihenfolge ändert nichts. | Beim Nachrechnen der Testfälle von Hand |
| Vite-Version mit bekannten Sicherheitslücken gewählt; danach versprach `npm audit fix` eine Lösung, die keine war | `npm audit` nach jeder Installation erneut ausgeführt |
| Der Klicktest las 2.941,30 € statt 4.158,81 €: Er las die Zahl, während sie noch hochzählte | Ergebnis passte nicht zur Rechnung von Hand; der Test liest jetzt den Endwert |
| Nach dem Redesign blieb toter Code: ein Hinweis, der überall wieder herausgefiltert wurde, zwei Komponenten für dieselbe Zeichnung, kaum sichtbare animierte Hintergrundflächen | Eigenes Review und Suche nach ungenutzten Klassen und Exporten |
| Ein Hintergrundserver wurde als „gestoppt“ gemeldet, lief aber weiter | Der nächste Start scheiterte am belegten Port |

Vollständiges Protokoll: [docs/ai-log.md](docs/ai-log.md)
