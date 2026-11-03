// Clicks through a full order on a phone-sized screen and checks every price and message.
// Run with `npm run e2e`. Uses the installed Edge; set E2E_BROWSER=chrome to use Chrome.
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { preview } from 'vite';

const server = await preview({ preview: { port: 4180, strictPort: true } });
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch({ channel: process.env.E2E_BROWSER ?? 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => consoleErrors.push(String(e)));

const errors = () => page.locator('.error').allInnerTexts();
// German number formatting puts a non-breaking space before "€". Compare with normal spaces.
const plain = (text) => text.replace(/\s+/g, ' ').trim();
const button = (name) => page.getByRole('button', { name });

async function addWindow({ width, height, opening, rollerShutter, sill, quantity = 1 }) {
  await page.getByLabel('Breite').fill(width);
  await page.getByLabel('Höhe').fill(height);
  if (opening) await page.locator('.choice', { hasText: opening }).click();
  if (rollerShutter) await page.getByLabel('Rollladen').check();
  if (sill) await page.getByLabel('Neue Fensterbank innen').check();
  for (let i = 1; i < quantity; i++) await button('Eins mehr').click();
  await button('Fenster speichern').click();
}

try {
  await page.goto(url);

  // Step 1: windows
  await button('Fenster speichern').click();
  assert.deepEqual(await errors(), ['Bitte Breite in cm eingeben, z. B. 120.', 'Bitte Höhe in cm eingeben, z. B. 120.']);

  await addWindow({ width: '120', height: '140' });
  await button('+ Weiteres Fenster hinzufügen').click();
  await addWindow({ width: '60', height: '50', opening: 'Fest verglast', rollerShutter: true, quantity: 2 });
  await button('+ Weiteres Fenster hinzufügen').click();
  await page.getByLabel('Breite').fill('70');
  await page.locator('.choice', { hasText: 'Zweiflügelig' }).click();
  assert.deepEqual(await page.locator('.editor .error').allInnerTexts(), ['Zweiflügelige Fenster gibt es erst ab 80 cm Breite.']);
  await addWindow({ width: '200', height: '160', sill: true });
  assert.equal(await page.locator('.window-summary').count(), 3);
  await button('Weiter zur Auswahl (4 Fenster)').click();

  // Step 2: systems. Classic 70 and Nordic 68 are max. 180 cm wide, so window 3 doesn't fit.
  assert.equal(await page.locator('.system.disabled').count(), 2);
  assert.equal(await page.locator('.system.disabled .unavailable').first().innerText(), 'Nicht für Ihre Maße: Fenster 3 zu breit (max. 180 cm)');
  assert.equal(await button('Weiter').isDisabled(), true);
  const therm82 = page.locator('.system', { hasText: 'Therm 82' }).filter({ hasNotText: 'Plus' });
  assert.equal(plain(await therm82.locator('.system-price').innerText()), '4.158,81 €');
  await therm82.click();
  await button('Weiter').click();

  // Step 3: location
  await button('Richtpreis anzeigen').click();
  assert.deepEqual(await errors(), ['Bitte eine 5-stellige Postleitzahl eingeben.']);
  await page.getByLabel('Postleitzahl').fill('30159');
  await page.getByText('2. Obergeschoss').click();
  assert.equal(await page.locator('.notice').count(), 2);
  await button('Richtpreis anzeigen').click();

  // Step 4: result. Hand calculation, see README.
  // Read aria-label, not the visible number: the visible number counts up for 0.7 s.
  assert.equal(plain(await page.locator('.result-price').getAttribute('aria-label')), '4.158,81 €');
  const rows = (await page.locator('.breakdown tr').allInnerTexts()).map(plain);
  assert.deepEqual(rows, [
    'Kunststofffenster Therm 82 1,68 m² × 395,00 €/m² 663,60 €',
    'Kunststofffenster Therm 82 0,30 m², berechnet mit Mindestfläche 0,80 m² × 395,00 €/m² 316,00 €',
    'Nachlass Festverglasung 15 % auf den Fensterpreis -47,40 €',
    'Rollladen 0,60 m × 95,00 €/m 57,00 €',
    '2 Stück 2 × 325,60 € 651,20 €',
    'Kunststofffenster Therm 82 3,20 m² × 395,00 €/m² 1.264,00 €',
    'Aufpreis zweiflügelig 120,00 €',
    'Fensterbank innen 2,00 m × 38,00 €/m 76,00 €',
    'Montage inkl. Ausbau und Entsorgung der Altfenster 4 × 180,00 € 720,00 €',
    'Summe netto 3.494,80 €',
    'MwSt. 19 % 664,01 €',
    'Richtpreis inkl. MwSt. 4.158,81 €',
  ]);
  assert.deepEqual(await page.locator('.notes strong').allInnerTexts(), [
    'Außerhalb unseres Montagegebiets',
    'Eventuell Gerüst nötig',
    'Große Fenster',
  ]);
  assert.equal(await page.locator('.info').count(), 1, 'subsidy note for Therm 82 (Uw 0.90)');

  // Step 5: contact
  await button('Kostenloses Aufmaß anfragen').first().click();
  await button('Anfrage absenden').click();
  assert.equal((await errors()).length, 5);
  await page.getByLabel('Name', { exact: true }).fill('Erika Mustermann');
  await page.getByLabel('Telefon').fill('040 123456');
  await page.getByLabel('Straße und Hausnummer').fill('Beispielweg 5');
  await page.getByLabel('Ort', { exact: true }).fill('Hannover');
  await page.locator('#contact-consent').check();
  await button('Anfrage absenden').click();

  // Step 6: summary, kept after a reload
  assert.match(await page.locator('.summary').innerText(), /Beispielweg 5, 30159 Hannover/);
  await page.reload();
  assert.equal(await page.locator('h1').innerText(), 'Vielen Dank für Ihre Anfrage!');

  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no sideways scrolling');
  assert.deepEqual(consoleErrors, []);
  console.log('e2e: full order checked, all assertions passed');
} finally {
  await browser.close();
  await server.close();
}
