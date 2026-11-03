/* Scuola facile — controlla i file di dati prima di pubblicare.
   Uso: npm run controlla */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { TIPI_NOTI } from '../app/blocchi.js';

/* Tag inline ammessi dentro i testi. Tutto il resto è un errore:
   i contenuti devono restare leggibili e identici a quelli approvati.
   svg e path ci sono perché musica mette i glifi delle note dentro al testo
   e dentro alle tabelle: sono disegni piccoli, non impaginazione. */
const TAG_OK = new Set(['b', 'i', 'u', 'br', 'span', 'sub', 'sup', 'svg', 'path']);
const CLASSI_OK = new Set([
  'muted', 'f-red', 'f-blue', 'f-green', 'f-orange', 'f-purple', 'f-ink', 'f-muted',
  'fig', 'mini', 'gl', 'mo', 'mb', 'mot', 'mbt',
]);
const COLORI = new Set(['ink', 'blue', 'green', 'orange', 'purple', 'red', 'teal']);

let errori = 0, avvisi = 0;
const err = (dove, m) => { console.error(`✗ ${dove}: ${m}`); errori++; };
const avv = (dove, m) => { console.warn(`! ${dove}: ${m}`); avvisi++; };

function testo(dove, s) {
  if (typeof s !== 'string') return;
  for (const m of s.matchAll(/<\/?([a-zA-Z0-9]+)([^>]*)>/g)) {
    const tag = m[1].toLowerCase();
    if (!TAG_OK.has(tag)) { err(dove, `tag non ammesso <${tag}>`); continue; }
    const cls = m[2].match(/class="([^"]*)"/);
    if (cls) {
      for (const c of cls[1].split(/\s+/).filter(Boolean)) {
        if (!CLASSI_OK.has(c)) err(dove, `classe non ammessa "${c}" su <${tag}>`);
      }
    }
  }
  /* Tipografia: nel testo visibile apostrofo ’ e virgolette “ ”. */
  const visibile = s.replace(/<[^>]*>/g, '');
  if (visibile.includes("'")) avv(dove, 'apostrofo dritto: usa ’');
  if (/"/.test(visibile)) avv(dove, 'virgolette dritte: usa “ ”');
}

function blocco(dove, b, i) {
  const d = `${dove} blocco ${i + 1} (${b.t})`;
  if (!TIPI_NOTI.includes(b.t)) return err(dove, `blocco sconosciuto "${b.t}"`);
  if (b.t === 'html') avv(d, 'blocco "html": da convertire in un blocco vero');
  if (b.colore && !COLORI.has(b.colore)) err(d, `colore sconosciuto "${b.colore}"`);

  if (b.t === 'coniugazione' || b.t === 'pronuncia' || b.t === 'voce') {
    if (!b.lingua) err(d, 'manca "lingua" (per esempio "de-DE")');
    else if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(b.lingua)) err(d, `lingua "${b.lingua}" scritta male`);
  }
  if (b.t === 'coniugazione') {
    if (!(b.righe || []).length) err(d, 'nessuna riga');
    (b.righe || []).forEach((r, k) => {
      if (!r.p) err(d, `riga ${k + 1}: manca il pronome "p"`);
      if (!r.radice) err(d, `riga ${k + 1}: manca "radice"`);
      if (!r.dice) avv(d, `riga ${k + 1}: manca "dice", la pronuncia scritta all’italiana`);
    });
  }
  if (b.t === 'pronuncia') {
    (b.regole || []).forEach((r, k) => {
      if (!r.lettere || !r.esempio) err(d, `regola ${k + 1}: mancano "lettere" o "esempio"`);
    });
  }

  if (b.t === 'gioco') {
    const TIPI_GIOCO = ['scelta', 'ascolta', 'note'];
    if (!TIPI_GIOCO.includes(b.tipo)) return err(d, `gioco sconosciuto "${b.tipo}"`);
    if (!b.record) avv(d, 'manca "record": senza chiave il punteggio migliore non si salva');
    if (b.tipo === 'scelta') {
      const n = (b.elenco || []).length;
      if (n < 3) err(d, `servono almeno 3 domande, ce ne sono ${n}`);
      (b.elenco || []).forEach((q, k) => {
        if (!q.d || !q.r) err(d, `domanda ${k + 1}: manca "d" o "r"`);
        testo(`${d} domanda ${k + 1}`, q.d || '');
        testo(`${d} domanda ${k + 1}`, q.r || '');
      });
    }
    if (b.tipo === 'ascolta') {
      if (!b.lingua) err(d, 'manca "lingua" (per esempio "de-DE")');
      const n = (b.voci || []).length;
      if (n < 3) err(d, `servono almeno 3 frasi, ce ne sono ${n}`);
    }
    if (b.tipo === 'note' && b.chiave && !['sol', 'basso'].includes(b.chiave)) {
      err(d, `chiave "${b.chiave}": vanno bene solo "sol" e "basso"`);
    }
    return;
  }

  if (b.t === 'svg') {
    if (!b.viewBox) err(d, 'manca viewBox');
    if (!b.alt) avv(d, 'manca alt: il disegno non è descritto');
    if (/\bfill="#|stroke="#/.test(b.body || '')) {
      avv(d, 'colore scritto a mano: in tema scuro non cambia');
    }
    return; /* dentro l'SVG i tag sono quelli di SVG, non quelli del testo */
  }
  for (const [k, v] of Object.entries(b)) {
    if (k === 't' || k === 'stile' || k === 'colore') continue;
    if (typeof v === 'string') testo(d, v);
    else if (Array.isArray(v)) v.forEach(x => {
      if (typeof x === 'string') testo(d, x);
      else if (x && typeof x === 'object') Object.values(x).forEach(y => {
        if (typeof y === 'string') testo(d, y);
        else if (Array.isArray(y)) y.forEach(z => typeof z === 'string' && testo(d, z));
      });
    });
    else if (v && typeof v === 'object') Object.values(v).forEach(x => {
      if (typeof x === 'string') testo(d, x);
      else if (Array.isArray(x)) x.forEach(y => {
        if (typeof y === 'string') testo(d, y);
        else if (y && typeof y === 'object') Object.values(y).forEach(z =>
          typeof z === 'string' && testo(d, z));
      });
    });
  }
}

function ripasso(dove, r) {
  if (!r.titolo) err(dove, 'manca il titolo');
  const sezioni = new Set((r.sezioni || []).map(s => s.nome));
  for (const s of r.sezioni || []) {
    if (!COLORI.has(s.colore)) err(dove, `sezione "${s.nome}": colore "${s.colore}" sconosciuto`);
  }
  if (!(r.pagine || []).length) return err(dove, 'nessuna pagina');

  r.pagine.forEach((p, i) => {
    const d = `${dove} p${i + 1} "${p.titolo || '?'}"`;
    if (!p.titolo) err(d, 'manca il titolo');
    if (!sezioni.has(p.sezione)) err(d, `sezione "${p.sezione}" non dichiarata`);
    testo(d, p.titolo);
    (p.blocchi || []).forEach((b, k) => blocco(d, b, k));
  });

  /* La prima pagina deve dare i 3 passi: Leggi, Sottolinea, Disegna. */
  const primi = r.pagine[0].blocchi || [];
  if (!primi.some(b => b.t === 'passi')) {
    avv(`${dove} p1`, 'la prima pagina non ha i 3 passi (Leggi, Sottolinea, Disegna)');
  }
  /* Ogni materia deve avere “Errori da non fare” e “Tutto in una pagina”. */
  const titoli = r.pagine.map(p => p.titolo.toLowerCase());
  if (!titoli.some(t => t.includes('errori da non fare')) &&
      !r.pagine.some(p => (p.blocchi || []).some(b => b.t === 'schema'))) {
    avv(dove, 'manca “Errori da non fare”');
  }
  if (!r.pagine.some(p => (p.blocchi || []).some(b => b.t === 'schema'))) {
    avv(dove, 'manca la pagina “Tutto in una pagina”');
  }
}

function schema(dove, s) {
  if (!s.centro) err(dove, 'manca il centro');
  const n = (s.riquadri || []).length;
  if (n !== 6) avv(dove, `${n} riquadri invece di 6: in stampa l’A4 orizzontale potrebbe non bastare`);
  for (const k of s.riquadri || []) {
    if (!COLORI.has(k.colore)) err(dove, `riquadro "${k.titolo}": colore "${k.colore}" sconosciuto`);
    (k.voci || []).forEach(v => testo(`${dove} "${k.titolo}"`, v));
  }
  if (!(s.errori || []).length) avv(dove, 'manca “Errori da non fare”');
}

function verifica(dove, v) {
  if (!v.titolo) err(dove, 'manca il titolo');
  if (!(v.esercizi || []).length) return err(dove, 'nessun esercizio');
  let totale = 0;
  v.esercizi.forEach((e, i) => {
    const d = `${dove} es ${i + 1}`;
    if (!e.consegna) err(d, 'manca la consegna');
    if (!v.senzaPunti && typeof e.punti !== 'number') err(d, 'mancano i punti');
    else totale += e.punti || 0;
    if (!v.senzaPunti && !e.soluzione) err(d, 'manca la soluzione');
    testo(d, e.consegna || '');
    testo(d, e.regola || '');
    testo(d, e.soluzione || '');
  });
  if (v.voto && v.voto.length && v.voto[0][1] !== totale) {
    avv(dove, `il voto massimo copre ${v.voto[0][1]} punti ma il totale è ${totale}`);
  }
}

/* --- percorso --- */
const radice = new URL('..', import.meta.url).pathname;
const indice = JSON.parse(readFileSync(join(radice, 'indice.json'), 'utf8'));
const materie = new Set(indice.materie.map(m => m.id));

for (const v of indice.argomenti) {
  const dir = join(radice, 'materie', v.materia, v.cartella);
  const dove = `${v.materia}/${v.cartella}`;
  if (!materie.has(v.materia)) err(dove, `materia "${v.materia}" non è in indice.json`);
  if (!existsSync(dir)) { err(dove, 'la cartella non esiste'); continue; }
  for (const f of ['meta.json', 'ripasso.json']) {
    if (!existsSync(join(dir, f))) err(dove, `manca ${f}`);
  }
  if (existsSync(join(dir, 'meta.json'))) {
    const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'));
    if (!meta.argomento) err(dove, 'in meta.json manca "argomento": è il titolo che si vede');
    if (meta.verifica || meta.data) avv(dove, 'in meta.json c’è una data: i titoli sono gli argomenti, non le date');
    testo(`${dove} meta`, meta.argomento || '');
  }
  if (existsSync(join(dir, 'ripasso.json'))) {
    ripasso(dove, JSON.parse(readFileSync(join(dir, 'ripasso.json'), 'utf8')));
  }
  if (existsSync(join(dir, 'schema.json'))) {
    schema(`${dove} schema`, JSON.parse(readFileSync(join(dir, 'schema.json'), 'utf8')));
  }
  const vdir = join(dir, 'verifiche');
  if (existsSync(vdir)) {
    for (const f of readdirSync(vdir).filter(f => f.endsWith('.json'))) {
      verifica(`${dove} ${f}`, JSON.parse(readFileSync(join(vdir, f), 'utf8')));
    }
  }
}

/* Niente foto o file grossi finiti per sbaglio nel repo. */
function pesanti(dir, limite = 600 * 1024) {
  for (const f of readdirSync(dir)) {
    if (f.startsWith('.') || f === 'node_modules' || f === '_input' || f === '_lavoro') continue;
    const p = join(dir, f);
    const s = statSync(p);
    if (s.isDirectory()) pesanti(p, limite);
    else if (s.size > limite) avv(f, `file da ${Math.round(s.size / 1024)} KB: serve davvero?`);
  }
}
pesanti(radice);

console.log(`\n${errori} errori, ${avvisi} avvisi`);
process.exit(errori ? 1 : 0);
