/* Scuola facile — gioco a scelta multipla.
   Dati del blocco:
   { "t":"gioco", "tipo":"scelta", "consegna":"…", "totale":10, "record":"mate-insiemi",
     "elenco":[ { "d":"domanda", "r":"risposta giusta", "sbagliate":["…","…"] } ] }
   "consegna" si può ripetere dentro una singola domanda, quando il mazzo
   mette insieme domande di tipo diverso. */

import { giostra, mescola, opzioni } from './comune.js';

export function monta(el, dati) {
  const elenco = (dati.elenco || []).filter(x => x && x.d && x.r);
  if (elenco.length < 3) {
    el.innerHTML = '<p class="muted">Questo gioco ha bisogno di almeno 3 domande.</p>';
    return;
  }

  const totale = Math.min(dati.totale || 10, 30);
  const tutte = elenco.map(x => x.r);

  /* Si pesca dal mazzo mescolato, così le domande non si ripetono subito. */
  let mazzo = [];
  function pesca() {
    if (!mazzo.length) mazzo = mescola(elenco);
    return mazzo.pop();
  }

  const consegna = dati.consegna || 'Scegli la risposta giusta.';

  giostra(el, {
    totale,
    record: dati.record,
    crea() {
      const q = pesca();
      const sbagliate = (q.sbagliate && q.sbagliate.length) ? q.sbagliate : tutte;
      return { d: q.d, consegna: q.consegna || consegna, giusta: q.r, scelte: opzioni(q.r, sbagliate) };
    },
    disegna: q => `<div class="domanda">
      <div class="tipo">${q.consegna}</div>
      <div class="testo">${q.d}</div>
    </div>`,
    seGiusto: () => 'Giusto!',
    seSbagliato: q => `Era: ${q.giusta}`,
  });
}
