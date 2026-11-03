/* Scuola facile — confronta il ripasso rigenerato dai dati con il deck HTML del
   prototipo, pagina per pagina e carattere per carattere.
   Serve a essere sicuri che migrando non si sia cambiato un testo già approvato.

   Uso: node scripts/fedelta.mjs \
          materie/<materia>/<cartella>/ripasso.json \
          contenuti-attuali/<materia>/ripasso_<materia>.html \
          [materie/<materia>/<cartella>/schema.json] */
import { readFileSync } from 'node:fs';
import { renderBlocchi } from '../app/blocchi.js';

const [, , jsonPath, htmlPath, schemaPath] = process.argv;
const dati = JSON.parse(readFileSync(jsonPath, 'utf8'));
const schema = schemaPath ? JSON.parse(readFileSync(schemaPath, 'utf8')) : null;
const html = readFileSync(htmlPath, 'utf8');

const originali = [...html.matchAll(
  /<section class="slide[^"]*" data-sec="([^"]*)" data-col="([^"]*)"[^>]*>\s*<div class="inner"><h2>(.*?)<\/h2>(.*?)<\/div><\/section>/gs
)].map(m => ({ sez: m[1], col: m[2], titolo: m[3], corpo: m[4].trim() }));

const norm = s => s
  .replace(/<defs>.*?<\/defs>/gs, '')
  .replace(/>\s+</g, '><')
  .replace(/\s+/g, ' ')
  .trim();

let ko = 0;
if (originali.length !== dati.pagine.length) {
  console.log(`DIVERSO numero di pagine: ${originali.length} vs ${dati.pagine.length}`);
  ko++;
}
dati.pagine.forEach((p, i) => {
  const o = originali[i];
  if (!o) return;
  const a = norm(o.corpo);
  const b = norm(renderBlocchi(p.blocchi, { schema }));
  if (p.titolo !== o.titolo) { console.log(`p${i + 1} titolo: "${o.titolo}" vs "${p.titolo}"`); ko++; }
  if (a !== b) {
    ko++;
    let k = 0;
    while (k < a.length && a[k] === b[k]) k++;
    console.log(`p${i + 1} "${p.titolo}" diverso al carattere ${k} di ${a.length}`);
    console.log('  originale: …' + a.slice(Math.max(0, k - 70), k + 90));
    console.log('  nuovo    : …' + b.slice(Math.max(0, k - 70), k + 90));
  }
});
console.log(ko ? `\n${ko} differenze` : `\nIdentico: ${dati.pagine.length} pagine, carattere per carattere.`);
