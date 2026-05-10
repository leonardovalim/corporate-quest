#!/usr/bin/env node
/**
 * Capture screenshots for the README using Puppeteer.
 *
 * Pre-requisite: `npm i -D puppeteer` (one-time)
 * Usage:         node docs/capture-screenshots.mjs
 *
 * The dev server must be running on localhost:8080 first.
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'screenshots');
mkdirSync(OUT, { recursive: true });

const save = (name) => path.join(OUT, name);
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

  // ── 1. Home ────────────────────────────────────────────────
  console.log('📸 01-home');
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
  await delay(2000);
  await page.screenshot({ path: save('01-home.png') });

  // ── 2. Onboarding – Nome ───────────────────────────────────
  await page.click('button.press-start');
  await delay(800);
  await page.type('input', 'Alex Santos');
  await page.evaluate(() =>
    [...document.querySelectorAll('button')].find(b => b.textContent.includes('PRÓXIMO'))?.click()
  );
  await delay(800);

  // ── 3. Classe ──────────────────────────────────────────────
  console.log('📸 02-classes');
  await page.screenshot({ path: save('02-classes.png') });
  await page.evaluate(() =>
    [...document.querySelectorAll('button.sel-card')].find(b => b.textContent.includes('Engineer'))?.click()
  );
  await delay(800);

  // ── 4. Origem ──────────────────────────────────────────────
  console.log('📸 03-origin');
  await page.screenshot({ path: save('03-origin.png') });
  await page.evaluate(() =>
    [...document.querySelectorAll('button.sel-card')].find(b => b.textContent.includes('Startup Survivor'))?.click()
  );
  await delay(800);

  // ── 5. Tendência ───────────────────────────────────────────
  console.log('📸 04-alignment');
  await page.screenshot({ path: save('04-alignment.png') });
  await page.evaluate(() =>
    [...document.querySelectorAll('button.sel-card')].find(b => b.textContent.includes('Chaotic Good'))?.click()
  );
  await delay(800);

  // ── 6. Atributos ───────────────────────────────────────────
  const plusBtns = await page.$$('.abr-btn');
  // TEC = index 5 (3rd row × 2 buttons per row → idx 4=minus, 5=plus)
  // RES = index 7
  if (plusBtns[5]) await plusBtns[5].click();
  await delay(200);
  if (plusBtns[7]) await plusBtns[7].click();
  await delay(500);
  console.log('📸 05-attributes');
  await page.screenshot({ path: save('05-attributes.png') });
  await page.evaluate(() =>
    [...document.querySelectorAll('button')].find(b => b.textContent.includes('PRÓXIMO'))?.click()
  );
  await delay(800);

  // ── 7. Habilidade ──────────────────────────────────────────
  console.log('📸 06-skills');
  await page.screenshot({ path: save('06-skills.png') });
  await page.evaluate(() =>
    [...document.querySelectorAll('button.sel-card')].find(b => b.textContent.includes('Debug Master'))?.click()
  );
  await delay(800);

  // ── 8. Resumo ──────────────────────────────────────────────
  console.log('📸 07-summary');
  await page.screenshot({ path: save('07-summary.png') });

  // ── 9. Gameplay ────────────────────────────────────────────
  await page.evaluate(() =>
    [...document.querySelectorAll('button.press-start')].find(b => b.textContent.includes('COMEÇAR'))?.click()
  );
  console.log('⏳ Waiting for AI to generate narrative...');
  await delay(20000);
  console.log('📸 08-gameplay');
  await page.screenshot({ path: save('08-gameplay.png') });

  await browser.close();
  console.log(`\n✅ All screenshots saved to ${OUT}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
