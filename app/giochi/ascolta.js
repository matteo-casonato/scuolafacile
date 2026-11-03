/* Scuola facile — “Ascolta e scegli”, per le lingue.
   Dati del blocco:
   { "t":"gioco", "tipo":"ascolta", "lingua":"de-DE", "totale":10, "record":"tedesco-verbi",
     "voci":[ { "testo":"ich wohne", "it":"io abito" } ] } */

import { giostra, opzioni } from './comune.js';
import { parla, montaAudio, controlloVelocita, avvisoVoce } from '../audio.js';

export function monta(el, dati) {
  const voci = (dati.voci || []).filter(v => v && v.testo);
  if (voci.length < 3) {
    el.innerHTML = '<p class="muted">Questo gioco ha bisogno di almeno 3 frasi.</p>';
    return;
  }

  const lingua = dati.lingua || 'it-IT';
  el.innerHTML = controlloVelocita() + avvisoVoce(lingua) + '<div data-giro></div>';
  montaAudio(el);

  const tutti = voci.map(v => v.testo);

  giostra(el.querySelector('[data-giro]'), {
    totale: Math.min(dati.totale || 10, 30),
    record: dati.record,
    crea() {
      const v = voci[Math.floor(Math.random() * voci.length)];
      return { testo: v.testo, it: v.it || '', giusta: v.testo, scelte: opzioni(v.testo, tutti) };
    },
    disegna: () => `<div class="domanda">
      <div class="tipo">Ascolta e scegli che cosa hai sentito</div>
      <button class="ascolta" type="button" data-ripeti aria-label="Riascolta">🔊</button>
      <div class="aiuto">tocca per riascoltare</div>
    </div>`,
    dopoDisegno(q, dove) {
      dove.querySelector('[data-ripeti]').addEventListener('click', () => parla(q.testo, lingua));
      setTimeout(() => parla(q.testo, lingua), 250);
    },
    dopoRisposta: q => parla(q.testo, lingua),
    seGiusto: q => `Giusto! ${q.testo}${q.it ? ` — ${q.it}` : ''}`,
    seSbagliato: q => `Era: ${q.testo}${q.it ? ` — ${q.it}` : ''}`,
  });
}
