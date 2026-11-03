/* Scuola facile — PDF da stampare.
   Uso: npm run pdf -- matematica/insiemi-grafici-geometria
   Produce il PDF del ripasso (una pagina del deck per foglio) e quello di
   ogni prova, dentro _lavoro/pdf/. */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

const v = process.argv[2];
if (!v) { console.error('serve: npm run pdf -- <materia>/<cartella>'); process.exit(1); }
const [materia] = v.split('/');

const PORTA = 8098;
const server = spawn(process.execPath, [new URL('serve.mjs', import.meta.url).pathname, PORTA],
                     { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 400));

const out = new URL('../_lavoro/pdf/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ colorScheme: 'light' });
await page.goto(`http://localhost:${PORTA}/ripasso.html?v=${v}`);
await page.waitForSelector('.slide');
await page.evaluate(() => {
  document.querySelectorAll('details').forEach(d => { d.open = true; });
  document.querySelectorAll('.slide').forEach(s => s.classList.remove('nascosta'));
});
await page.emulateMedia({ media: 'print' });

const file = `${out}Ripasso_${materia}.pdf`;
await page.pdf({
  path: file, format: 'A4', printBackground: true,
  margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' },
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: '<div style="font-size:9px;color:#888;width:100%;text-align:center">' +
                  '<span class="pageNumber"></span> / <span class="totalPages"></span></div>',
});

console.log('fatto:', file);

/* e tutte le prove da stampare di questo argomento */
const indice = JSON.parse(
  await (await fetch(`http://localhost:${PORTA}/indice.json`)).text());
const [, cartella] = v.split('/');
const arg = (indice.argomenti || []).find(a => a.materia === materia && a.cartella === cartella);
for (const prova of (arg && arg.prove) || []) {
  const pg = await browser.newPage({ colorScheme: 'light' });
  await pg.goto(`http://localhost:${PORTA}/verifica.html?v=${v}&n=${encodeURIComponent(prova.file)}`);
  await pg.waitForSelector('.prova');
  await pg.emulateMedia({ media: 'print' });
  const nome = `${out}${materia}_${prova.file.replace(/\.json$/, '')}.pdf`;
  await pg.pdf({
    path: nome, format: 'A4', printBackground: true,
    margin: { top: '13mm', bottom: '15mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="font-size:8px;color:#888;width:100%;text-align:center">' +
                    '<span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  await pg.close();
  console.log('fatto:', nome);
}

await browser.close();
server.kill();
