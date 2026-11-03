/* Scuola facile — PDF da stampare.
   Uso: npm run pdf -- matematica/insiemi-grafici-geometria
   Produce _lavoro/pdf/Ripasso_<materia>.pdf (una pagina del deck per foglio). */

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
await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
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

await browser.close();
server.kill();
console.log('fatto:', file);
