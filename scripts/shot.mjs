/* Scuola facile — screenshot di controllo a 390 px, tema chiaro e scuro.
   Uso: npm run foto -- matematica/insiemi-grafici-geometria
   Le immagini finiscono in _lavoro/foto/. */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

const v = process.argv[2];
if (!v) { console.error('serve: npm run foto -- <materia>/<cartella>'); process.exit(1); }

const PORTA = 8099;
const server = spawn(process.execPath, [new URL('serve.mjs', import.meta.url).pathname, PORTA],
                     { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 400));

const out = new URL('../_lavoro/foto/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
let problemi = 0;

for (const tema of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 800 }, colorScheme: tema });
  const errori = [];
  page.on('pageerror', e => errori.push(String(e)));
  page.on('console', m => m.type() === 'error' && errori.push(m.text()));

  await page.goto(`http://localhost:${PORTA}/ripasso.html?v=${v}`);
  await page.waitForSelector('.slide', { timeout: 5000 });
  const n = await page.evaluate(() => document.querySelectorAll('.slide').length);

  for (let i = 0; i < n; i++) {
    await page.evaluate(k => {
      const sl = document.querySelectorAll('.slide');
      sl.forEach((s, j) => { s.hidden = j !== k; });
      document.querySelectorAll('details').forEach(d => { d.open = true; });
      /* la testata la aggiorna di solito deck.js: qui la sistemiamo a mano */
      document.body.className = 'c-' + sl[k].dataset.col;
      document.getElementById('sec').textContent = sl[k].dataset.sec;
      document.getElementById('count').textContent = `Pagina ${k + 1} di ${sl.length}`;
      document.querySelectorAll('#progress span').forEach((s, j) => s.classList.toggle('now', j === k));
    }, i);
    const h = await page.evaluate(k => document.querySelectorAll('.slide')[k].scrollHeight, i);
    await page.setViewportSize({ width: 390, height: Math.max(800, h + 150) });
    await page.screenshot({ path: `${out}${tema}-${String(i + 1).padStart(2, '0')}.png` });
    await page.setViewportSize({ width: 390, height: 800 });
  }

  /* Testo che esce dal suo disegno o dalla pagina. */
  const fuori = await page.evaluate(() => {
    const brutti = [];
    document.querySelectorAll('.slide').forEach((s, k) => {
      s.hidden = false;
      s.querySelectorAll('svg').forEach(sv => {
        const box = sv.getBoundingClientRect();
        sv.querySelectorAll('text').forEach(t => {
          const b = t.getBoundingClientRect();
          if (b.width && (b.left < box.left - 1 || b.right > box.right + 1)) {
            brutti.push(`p${k + 1}: “${t.textContent}” esce dal disegno`);
          }
        });
      });
      s.hidden = true;
    });
    return brutti;
  });

  if (errori.length) { console.error(`${tema}: errori JS →`, errori.slice(0, 5)); problemi += errori.length; }
  if (fuori.length) { console.warn(`${tema}:`); fuori.forEach(f => console.warn('  !', f)); problemi += fuori.length; }
  console.log(`${tema}: ${n} pagine fotografate`);
  await page.close();
}

await browser.close();
server.kill();
console.log(problemi ? `\n${problemi} cose da guardare` : '\nNessun problema trovato.');
