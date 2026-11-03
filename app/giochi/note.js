/* Scuola facile — “Che nota è?”: una nota sul pentagramma, si tocca il suo nome.
   I glifi vengono da Noto Music (assets/glifi-musica.json).
   Dati del blocco:
   { "t":"gioco", "tipo":"note", "chiave":"sol", "da":-2, "a":9, "totale":10, "record":"musica-note" }
   da/a sono i gradi: 0 è la riga più in basso, 1 il primo spazio, e così via. */

import { giostra } from './comune.js';

const NOMI = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
/* Con la chiave di Sol la riga più in basso è un Mi; con quella di Basso è un Sol. */
const PARTENZA = { sol: 2, basso: 4 };
const GLIFO = { sol: 'clef', basso: 'fclef' };

const GAP = 16, Y1 = 110, X = 150;

export async function monta(el, dati) {
  let glifi;
  try {
    glifi = await (await fetch('assets/glifi-musica.json', { cache: 'force-cache' })).json();
  } catch (e) {
    el.innerHTML = '<p class="muted">Non riesco a caricare i simboli musicali.</p>';
    return;
  }

  const chiave = PARTENZA[dati.chiave] !== undefined ? dati.chiave : 'sol';
  const da = Number.isInteger(dati.da) ? dati.da : -2;
  const a = Number.isInteger(dati.a) ? dati.a : 9;

  const nome = grado => NOMI[(((grado + PARTENZA[chiave]) % 7) + 7) % 7];

  function glifo(id, x, base) {
    const s = GAP / 250;
    return `<path d="${glifi[id][0]}" transform="translate(${x},${base}) scale(${s},${-s})" class="gl"/>`;
  }

  function pentagramma(grado) {
    let h = '';
    for (let k = 0; k < 5; k++) {
      h += `<line x1="8" y1="${Y1 - k * GAP}" x2="252" y2="${Y1 - k * GAP}" class="s-ink" stroke-width="1.4"/>`;
    }
    h += glifo(GLIFO[chiave], 12, Y1);
    /* tagli addizionali sotto il pentagramma */
    for (let l = -2; l >= grado; l -= 2) {
      h += `<line x1="${X - 6}" y1="${Y1 - l * GAP / 2}" x2="${X + 20}" y2="${Y1 - l * GAP / 2}" class="s-ink" stroke-width="1.4"/>`;
    }
    /* e sopra */
    for (let l = 10; l <= grado; l += 2) {
      h += `<line x1="${X - 6}" y1="${Y1 - l * GAP / 2}" x2="${X + 20}" y2="${Y1 - l * GAP / 2}" class="s-ink" stroke-width="1.4"/>`;
    }
    h += glifo('whole', X, Y1 - (grado - 1) * GAP / 2);
    return `<svg viewBox="0 0 260 150" role="img" aria-label="Una nota sul pentagramma">${h}</svg>`;
  }

  let ultimo = null;
  function sorteggia() {
    let g;
    do { g = da + Math.floor(Math.random() * (a - da + 1)); } while (g === ultimo);
    ultimo = g;
    return g;
  }

  giostra(el, {
    totale: Math.min(dati.totale || 10, 30),
    record: dati.record,
    scelteCorte: true,
    crea() {
      const grado = sorteggia();
      return { grado, giusta: nome(grado), scelte: NOMI.slice() };
    },
    disegna: q => `<div class="domanda">
      <div class="tipo">Guarda la nota e tocca il suo nome</div>
      ${pentagramma(q.grado)}
    </div>`,
    seGiusto: q => `Giusto! È un ${q.giusta}.`,
    seSbagliato: q => `No, è un ${q.giusta}.`,
  });
}
